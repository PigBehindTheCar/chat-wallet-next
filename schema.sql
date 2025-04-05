-- 钱包应用数据库模式
-- SQLite 优化版本

-- 用户表
CREATE TABLE
    users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE,
        salt VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        preferences TEXT DEFAULT '{}'
    );

-- 创建更新时间触发器
CREATE TRIGGER update_user_timestamp
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

-- 钱包/账户表
CREATE TABLE
    wallets (
        wallet_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        wallet_name VARCHAR(50) NOT NULL,
        balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
        currency_code CHAR(3) NOT NULL DEFAULT 'CNY',
        is_default BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

-- 为钱包表添加更新时间触发器
CREATE TRIGGER update_wallet_timestamp
AFTER UPDATE ON wallets
BEGIN
    UPDATE wallets SET updated_at = CURRENT_TIMESTAMP WHERE wallet_id = NEW.wallet_id;
END;

-- 交易类别表
CREATE TABLE
    categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        icon VARCHAR(50),
        type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
        is_default BOOLEAN DEFAULT 0,
        is_system BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

-- 为类别表添加更新时间触发器
CREATE TRIGGER update_category_timestamp
AFTER UPDATE ON categories
BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE category_id = NEW.category_id;
END;

-- 预设用户数据
INSERT INTO users (user_id, username, password_hash, email, salt) 
VALUES (0, 'system', 'system_hash', 'system@example.com', 'system_salt');
-- 预设类别数据
INSERT INTO
    categories (user_id, name, icon, type, is_default, is_system)
VALUES
    (0, '餐饮', 'food', 'expense', 1, 1),
    (0, '交通', 'transport', 'expense', 1, 1),
    (0, '购物', 'shopping', 'expense', 1, 1),
    (0, '娱乐', 'entertainment', 'expense', 1, 1),
    (0, '住房', 'home', 'expense', 1, 1),
    (0, '工资', 'salary', 'income', 1, 1),
    (0, '投资', 'investment', 'income', 1, 1),
    (0, '奖金', 'bonus', 'income', 1, 1),
    (0, '礼金', 'gift', 'income', 1, 1);

-- 交易记录表
CREATE TABLE
    transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        wallet_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
        note TEXT,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (wallet_id) REFERENCES wallets (wallet_id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT
    );

-- 为交易记录表添加更新时间触发器
CREATE TRIGGER update_transaction_timestamp
AFTER UPDATE ON transactions
BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE transaction_id = NEW.transaction_id;
END;

-- 创建交易后更新钱包余额触发器
CREATE TRIGGER update_wallet_balance_after_insert
AFTER INSERT ON transactions
WHEN NEW.is_deleted = 0
BEGIN
    UPDATE wallets SET 
        balance = CASE
            WHEN NEW.transaction_type = 'income' THEN balance + NEW.amount
            WHEN NEW.transaction_type = 'expense' THEN balance - NEW.amount
            ELSE balance
        END
    WHERE wallet_id = NEW.wallet_id;
END;

-- 更新交易后更新钱包余额触发器
CREATE TRIGGER update_wallet_balance_after_update
AFTER UPDATE ON transactions
BEGIN
    -- 如果原交易未删除，恢复原余额
    UPDATE wallets SET
        balance = CASE
            WHEN OLD.transaction_type = 'income' AND OLD.is_deleted = 0 THEN balance - OLD.amount
            WHEN OLD.transaction_type = 'expense' AND OLD.is_deleted = 0 THEN balance + OLD.amount
            ELSE balance
        END
    WHERE wallet_id = OLD.wallet_id;
    
    -- 如果新交易未删除，应用新余额
    UPDATE wallets SET
        balance = CASE
            WHEN NEW.transaction_type = 'income' AND NEW.is_deleted = 0 THEN balance + NEW.amount
            WHEN NEW.transaction_type = 'expense' AND NEW.is_deleted = 0 THEN balance - NEW.amount
            ELSE balance
        END
    WHERE wallet_id = NEW.wallet_id;
END;

-- 删除交易后更新钱包余额触发器
CREATE TRIGGER update_wallet_balance_after_delete
AFTER DELETE ON transactions
WHEN OLD.is_deleted = 0
BEGIN
    UPDATE wallets SET
        balance = CASE
            WHEN OLD.transaction_type = 'income' THEN balance - OLD.amount
            WHEN OLD.transaction_type = 'expense' THEN balance + OLD.amount
            ELSE balance
        END
    WHERE wallet_id = OLD.wallet_id;
END;

-- 转账记录表（钱包之间的转账）
CREATE TABLE
    transfers (
        transfer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        from_wallet_id INTEGER NOT NULL,
        to_wallet_id INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        fee DECIMAL(12, 2) DEFAULT 0,
        note TEXT,
        transfer_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (from_wallet_id) REFERENCES wallets (wallet_id) ON DELETE RESTRICT,
        FOREIGN KEY (to_wallet_id) REFERENCES wallets (wallet_id) ON DELETE RESTRICT
    );

-- 为转账表添加更新时间触发器
CREATE TRIGGER update_transfer_timestamp
AFTER UPDATE ON transfers
BEGIN
    UPDATE transfers SET updated_at = CURRENT_TIMESTAMP WHERE transfer_id = NEW.transfer_id;
END;

-- 创建转账后更新钱包余额触发器
CREATE TRIGGER update_wallet_balance_after_transfer_insert
AFTER INSERT ON transfers
WHEN NEW.is_deleted = 0
BEGIN
    -- 从源钱包扣除金额（包括手续费）
    UPDATE wallets SET balance = balance - (NEW.amount + NEW.fee) 
    WHERE wallet_id = NEW.from_wallet_id;
    
    -- 向目标钱包添加金额
    UPDATE wallets SET balance = balance + NEW.amount 
    WHERE wallet_id = NEW.to_wallet_id;
END;

-- 更新转账后更新钱包余额触发器
CREATE TRIGGER update_wallet_balance_after_transfer_update
AFTER UPDATE ON transfers
BEGIN
    -- 如果从未删除变为已删除
    UPDATE wallets SET 
        balance = CASE
            -- 恢复源钱包余额
            WHEN OLD.is_deleted = 0 AND NEW.is_deleted = 1 THEN balance + (OLD.amount + OLD.fee)
            ELSE balance
        END
    WHERE wallet_id = OLD.from_wallet_id;
    
    UPDATE wallets SET 
        balance = CASE
            -- 恢复目标钱包余额
            WHEN OLD.is_deleted = 0 AND NEW.is_deleted = 1 THEN balance - OLD.amount
            ELSE balance
        END
    WHERE wallet_id = OLD.to_wallet_id;
    
    -- 如果从已删除变为未删除
    UPDATE wallets SET 
        balance = CASE
            -- 重新扣除源钱包余额
            WHEN OLD.is_deleted = 1 AND NEW.is_deleted = 0 THEN balance - (NEW.amount + NEW.fee)
            ELSE balance
        END
    WHERE wallet_id = NEW.from_wallet_id;
    
    UPDATE wallets SET 
        balance = CASE
            -- 重新添加目标钱包余额
            WHEN OLD.is_deleted = 1 AND NEW.is_deleted = 0 THEN balance + NEW.amount
            ELSE balance
        END
    WHERE wallet_id = NEW.to_wallet_id;
    
    -- 如果未删除状态下修改了金额
    UPDATE wallets SET 
        balance = CASE
            -- 先恢复原转账的余额变动，再应用新的转账
            WHEN OLD.is_deleted = 0 AND NEW.is_deleted = 0 AND 
                 (OLD.amount != NEW.amount OR OLD.fee != NEW.fee OR 
                  OLD.from_wallet_id != NEW.from_wallet_id OR OLD.to_wallet_id != NEW.to_wallet_id) 
            THEN 
                CASE
                    -- 如果是同一个源钱包，调整差额
                    WHEN OLD.from_wallet_id = NEW.from_wallet_id THEN 
                        balance + (OLD.amount + OLD.fee) - (NEW.amount + NEW.fee)
                    -- 如果是不同源钱包，恢复旧钱包余额
                    WHEN OLD.from_wallet_id != NEW.from_wallet_id AND wallet_id = OLD.from_wallet_id THEN 
                        balance + (OLD.amount + OLD.fee)
                    -- 如果是不同源钱包，扣减新钱包余额
                    WHEN OLD.from_wallet_id != NEW.from_wallet_id AND wallet_id = NEW.from_wallet_id THEN 
                        balance - (NEW.amount + NEW.fee)
                    ELSE balance
                END
            ELSE balance
        END
    WHERE wallet_id IN (OLD.from_wallet_id, NEW.from_wallet_id);
    
    UPDATE wallets SET 
        balance = CASE
            -- 先恢复原转账的余额变动，再应用新的转账
            WHEN OLD.is_deleted = 0 AND NEW.is_deleted = 0 AND 
                 (OLD.amount != NEW.amount OR 
                  OLD.from_wallet_id != NEW.from_wallet_id OR OLD.to_wallet_id != NEW.to_wallet_id) 
            THEN 
                CASE
                    -- 如果是同一个目标钱包，调整差额
                    WHEN OLD.to_wallet_id = NEW.to_wallet_id THEN 
                        balance - OLD.amount + NEW.amount
                    -- 如果是不同目标钱包，恢复旧钱包余额
                    WHEN OLD.to_wallet_id != NEW.to_wallet_id AND wallet_id = OLD.to_wallet_id THEN 
                        balance - OLD.amount
                    -- 如果是不同目标钱包，增加新钱包余额
                    WHEN OLD.to_wallet_id != NEW.to_wallet_id AND wallet_id = NEW.to_wallet_id THEN 
                        balance + NEW.amount
                    ELSE balance
                END
            ELSE balance
        END
    WHERE wallet_id IN (OLD.to_wallet_id, NEW.to_wallet_id);
END;

-- 删除转账后更新钱包余额触发器
CREATE TRIGGER update_wallet_balance_after_transfer_delete
AFTER DELETE ON transfers
WHEN OLD.is_deleted = 0
BEGIN
    -- 恢复源钱包余额
    UPDATE wallets SET balance = balance + (OLD.amount + OLD.fee) 
    WHERE wallet_id = OLD.from_wallet_id;
    
    -- 恢复目标钱包余额
    UPDATE wallets SET balance = balance - OLD.amount 
    WHERE wallet_id = OLD.to_wallet_id;
END;

-- 预算表
CREATE TABLE
    budgets (
        budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        amount DECIMAL(12, 2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE SET NULL
    );

-- 为预算表添加更新时间触发器
CREATE TRIGGER update_budget_timestamp
AFTER UPDATE ON budgets
BEGIN
    UPDATE budgets SET updated_at = CURRENT_TIMESTAMP WHERE budget_id = NEW.budget_id;
END;

-- 定期交易表
CREATE TABLE
    recurring_transactions (
        recurring_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        wallet_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT 1,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (wallet_id) REFERENCES wallets (wallet_id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT
    );

-- 为定期交易表添加更新时间触发器
CREATE TRIGGER update_recurring_timestamp
AFTER UPDATE ON recurring_transactions
BEGIN
    UPDATE recurring_transactions SET updated_at = CURRENT_TIMESTAMP WHERE recurring_id = NEW.recurring_id;
END;

-- 标签表
CREATE TABLE
    tags (
        tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

-- 为标签表添加更新时间触发器
CREATE TRIGGER update_tags_timestamp
AFTER UPDATE ON tags
BEGIN
    UPDATE tags SET updated_at = CURRENT_TIMESTAMP WHERE tag_id = NEW.tag_id;
END;

-- 交易标签关联表
CREATE TABLE
    transaction_tags (
        transaction_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (transaction_id, tag_id),
        FOREIGN KEY (transaction_id) REFERENCES transactions (transaction_id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE
    );

-- 审计日志表
CREATE TABLE
    audit_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

-- 创建索引
CREATE INDEX idx_transactions_user ON transactions (user_id);
CREATE INDEX idx_transactions_wallet ON transactions (wallet_id);
CREATE INDEX idx_transactions_category ON transactions (category_id);
CREATE INDEX idx_transactions_date ON transactions (transaction_date);
CREATE INDEX idx_wallets_user ON wallets (user_id);
CREATE INDEX idx_categories_user ON categories (user_id);
CREATE INDEX idx_budgets_user ON budgets (user_id);
CREATE INDEX idx_recurring_user ON recurring_transactions (user_id);

-- 创建视图
CREATE VIEW vw_monthly_summary AS
SELECT
    user_id,
    strftime('%Y-%m', transaction_date) AS month,
    transaction_type,
    SUM(amount) AS total_amount
FROM
    transactions
WHERE
    is_deleted = 0
GROUP BY
    user_id, strftime('%Y-%m', transaction_date), transaction_type;

CREATE VIEW vw_category_summary AS
SELECT
    t.user_id,
    c.name AS category_name,
    t.transaction_type,
    strftime('%Y-%m', t.transaction_date) AS month,
    SUM(t.amount) AS total_amount
FROM
    transactions t
JOIN
    categories c ON t.category_id = c.category_id
WHERE
    t.is_deleted = 0
GROUP BY
    t.user_id, c.name, t.transaction_type, strftime('%Y-%m', t.transaction_date);

CREATE VIEW vw_budget_status AS
SELECT
    b.budget_id,
    b.user_id,
    b.category_id,
    c.name AS category_name,
    b.amount AS budget_amount,
    COALESCE(SUM(t.amount), 0) AS spent_amount,
    b.amount - COALESCE(SUM(t.amount), 0) AS remaining_amount,
    b.start_date,
    b.end_date
FROM
    budgets b
LEFT JOIN
    categories c ON b.category_id = c.category_id
LEFT JOIN
    transactions t ON t.category_id = b.category_id AND t.user_id = b.user_id
        AND t.transaction_date BETWEEN b.start_date AND b.end_date
        AND t.transaction_type = 'expense' AND t.is_deleted = 0
GROUP BY
    b.budget_id, b.user_id, b.category_id, c.name, b.amount, b.start_date, b.end_date;
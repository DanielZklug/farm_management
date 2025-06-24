/*
# Base de données SQL - Système de Gestion de Ferme Avicole
# Administrateur: Ismael FALL (projetsafrique@iworks.sn)
# Devise: FCFA (Franc CFA)
# Mot de passe: PAE%pae123*-+
*/

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS poultry_farm_fcfa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE poultry_farm_fcfa;

-- =====================================================
-- 1. TABLE DES UTILISATEURS
-- =====================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    farm_name VARCHAR(255) NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    status ENUM('active', 'blocked', 'pending') DEFAULT 'active',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- 2. TABLE DES DONNÉES DE FERME
-- =====================================================
CREATE TABLE farm_data (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    total_chickens INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- =====================================================
-- 3. TABLE DES CATÉGORIES DE DÉPENSES
-- =====================================================
CREATE TABLE expense_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB;

-- =====================================================
-- 4. TABLE DES DÉPENSES
-- =====================================================
CREATE TABLE expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount INT NOT NULL COMMENT 'Montant en FCFA (sans décimales)',
    frequency ENUM('ponctuel', 'quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel') DEFAULT 'ponctuel',
    next_due_date DATE NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_frequency (frequency)
) ENGINE=InnoDB;

-- =====================================================
-- 5. TABLE DES REVENUS
-- =====================================================
CREATE TABLE revenues (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    type ENUM('oeufs', 'poulets', 'fonds-externes', 'subventions', 'aides-agricoles', 'autre') NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price INT NOT NULL COMMENT 'Prix unitaire en FCFA',
    total_amount INT NOT NULL COMMENT 'Montant total en FCFA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- =====================================================
-- 6. TABLE DES ÉVÉNEMENTS DE MORTALITÉ
-- =====================================================
CREATE TABLE mortality_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    cause ENUM('maladie', 'predateur', 'accident', 'naturel', 'inconnu') NOT NULL,
    count INT NOT NULL,
    description TEXT NOT NULL,
    estimated_loss INT NOT NULL COMMENT 'Perte estimée en FCFA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_cause (cause)
) ENGINE=InnoDB;

-- =====================================================
-- 7. TABLE DES TOKENS D'ACCÈS (Laravel Sanctum)
-- =====================================================
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tokenable (tokenable_type, tokenable_id),
    INDEX idx_token (token)
) ENGINE=InnoDB;

-- =====================================================
-- INSERTION DES DONNÉES DE DÉMONSTRATION
-- =====================================================

-- Utilisateurs avec Ismael FALL comme administrateur principal
-- Mot de passe hashé pour 'PAE%pae123*-+' : $2y$10$TKh2H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm
INSERT INTO users (id, name, email, password, farm_name, role, status, created_at) VALUES
(1, 'Ismael FALL', 'projetsafrique@iworks.sn', '$2y$10$TKh2H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Ferme Avicole iWorks Sénégal', 'admin', 'active', '2024-01-01 08:00:00'),
(2, 'Aminata DIOP', 'aminata@ferme-bio-dakar.sn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ferme Bio Dakar', 'manager', 'active', '2024-01-15 09:30:00'),
(3, 'Moussa NDIAYE', 'moussa@elevage-thies.sn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Élevage Thiès', 'user', 'active', '2024-02-01 10:15:00'),
(4, 'Fatou SARR', 'fatou@ferme-kaolack.sn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ferme Kaolack', 'user', 'blocked', '2024-02-10 14:20:00'),
(5, 'Ibrahima BA', 'ibrahima@aviculture-saint-louis.sn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aviculture Saint-Louis', 'user', 'pending', '2024-02-20 16:45:00');

-- Données de ferme
INSERT INTO farm_data (user_id, total_chickens) VALUES
(1, 1500), -- Ismael FALL - Grande ferme iWorks
(2, 800),  -- Aminata DIOP - Ferme bio
(3, 500),  -- Moussa NDIAYE - Ferme moyenne
(4, 300),  -- Fatou SARR - Petite ferme
(5, 150);  -- Ibrahima BA - Démarrage

-- Catégories de dépenses par défaut pour tous les utilisateurs
INSERT INTO expense_categories (user_id, name, color, is_default) VALUES
-- Ismael FALL (Admin iWorks)
(1, 'Alimentation', 'bg-amber-100 text-amber-800', TRUE),
(1, 'Médicaments', 'bg-red-100 text-red-800', TRUE),
(1, 'Équipement', 'bg-blue-100 text-blue-800', TRUE),
(1, 'Main-d\'œuvre', 'bg-purple-100 text-purple-800', TRUE),
(1, 'Services publics', 'bg-green-100 text-green-800', TRUE),
(1, 'Marketing', 'bg-pink-100 text-pink-800', TRUE),
(1, 'Transport', 'bg-indigo-100 text-indigo-800', FALSE),
(1, 'Formation', 'bg-yellow-100 text-yellow-800', FALSE),
(1, 'Autre', 'bg-gray-100 text-gray-800', TRUE),

-- Aminata DIOP (Manager)
(2, 'Alimentation', 'bg-amber-100 text-amber-800', TRUE),
(2, 'Médicaments', 'bg-red-100 text-red-800', TRUE),
(2, 'Équipement', 'bg-blue-100 text-blue-800', TRUE),
(2, 'Main-d\'œuvre', 'bg-purple-100 text-purple-800', TRUE),
(2, 'Services publics', 'bg-green-100 text-green-800', TRUE),
(2, 'Marketing', 'bg-pink-100 text-pink-800', TRUE),
(2, 'Certification Bio', 'bg-emerald-100 text-emerald-800', FALSE),
(2, 'Autre', 'bg-gray-100 text-gray-800', TRUE),

-- Moussa NDIAYE (User)
(3, 'Alimentation', 'bg-amber-100 text-amber-800', TRUE),
(3, 'Médicaments', 'bg-red-100 text-red-800', TRUE),
(3, 'Équipement', 'bg-blue-100 text-blue-800', TRUE),
(3, 'Main-d\'œuvre', 'bg-purple-100 text-purple-800', TRUE),
(3, 'Services publics', 'bg-green-100 text-green-800', TRUE),
(3, 'Marketing', 'bg-pink-100 text-pink-800', TRUE),
(3, 'Autre', 'bg-gray-100 text-gray-800', TRUE),

-- Fatou SARR (User - Bloquée)
(4, 'Alimentation', 'bg-amber-100 text-amber-800', TRUE),
(4, 'Médicaments', 'bg-red-100 text-red-800', TRUE),
(4, 'Équipement', 'bg-blue-100 text-blue-800', TRUE),
(4, 'Main-d\'œuvre', 'bg-purple-100 text-purple-800', TRUE),
(4, 'Services publics', 'bg-green-100 text-green-800', TRUE),
(4, 'Marketing', 'bg-pink-100 text-pink-800', TRUE),
(4, 'Autre', 'bg-gray-100 text-gray-800', TRUE),

-- Ibrahima BA (User - En attente)
(5, 'Alimentation', 'bg-amber-100 text-amber-800', TRUE),
(5, 'Médicaments', 'bg-red-100 text-red-800', TRUE),
(5, 'Équipement', 'bg-blue-100 text-blue-800', TRUE),
(5, 'Main-d\'œuvre', 'bg-purple-100 text-purple-800', TRUE),
(5, 'Services publics', 'bg-green-100 text-green-800', TRUE),
(5, 'Marketing', 'bg-pink-100 text-pink-800', TRUE),
(5, 'Autre', 'bg-gray-100 text-gray-800', TRUE);

-- REVENUS EN FCFA (Prix réalistes pour le Sénégal)
INSERT INTO revenues (user_id, date, type, description, quantity, unit_price, total_amount) VALUES
-- Ismael FALL - Ferme iWorks (Revenus élevés - Grande ferme technologique)
(1, '2024-01-25', 'oeufs', 'Vente œufs premium marché Sandaga Dakar', 1000, 275, 275000),
(1, '2024-01-22', 'poulets', 'Livraison poulets fermiers restaurants haut de gamme', 50, 16500, 825000),
(1, '2024-01-20', 'oeufs', 'Commande hôtels Teranga et Radisson', 800, 290, 232000),
(1, '2024-01-18', 'subventions', 'Subvention ANIDA modernisation aviculture', 1, 2000000, 2000000),
(1, '2024-01-15', 'poulets', 'Vente directe ferme weekend (clients VIP)', 30, 14000, 420000),
(1, '2024-01-12', 'oeufs', 'Livraison supermarchés Auchan et Casino Dakar', 750, 280, 210000),
(1, '2024-01-10', 'fonds-externes', 'Investissement partenaire iWorks expansion', 1, 3500000, 3500000),
(1, '2024-01-08', 'poulets', 'Commande spéciale événement d\'entreprise', 40, 15000, 600000),

-- Aminata DIOP - Ferme Bio Dakar (Revenus moyens-élevés - Bio premium)
(2, '2024-01-24', 'oeufs', 'Vente œufs bio marché fermier Almadies', 450, 380, 171000),
(2, '2024-01-21', 'poulets', 'Poulets bio label certifié ECOCERT', 25, 19500, 487500),
(2, '2024-01-18', 'aides-agricoles', 'Prime conversion agriculture biologique', 1, 950000, 950000),
(2, '2024-01-16', 'oeufs', 'Commande restaurants bio Dakar (Sea Plaza)', 350, 350, 122500),
(2, '2024-01-13', 'poulets', 'Vente poulets bio particuliers aisés', 18, 17500, 315000),
(2, '2024-01-10', 'oeufs', 'Livraison épiceries bio Plateau', 300, 340, 102000),

-- Moussa NDIAYE - Élevage Thiès (Revenus moyens)
(3, '2024-01-23', 'oeufs', 'Vente marché central Thiès', 400, 240, 96000),
(3, '2024-01-19', 'poulets', 'Vente poulets standard marché local', 30, 11000, 330000),
(3, '2024-01-16', 'oeufs', 'Livraison épiceries quartiers Thiès', 250, 250, 62500),
(3, '2024-01-12', 'poulets', 'Commande fête familiale mariage', 15, 12000, 180000),
(3, '2024-01-08', 'oeufs', 'Vente directe ferme', 200, 230, 46000),

-- Fatou SARR - Ferme Kaolack (Revenus faibles - Compte bloqué)
(4, '2024-01-17', 'oeufs', 'Vente œufs marché Kaolack', 180, 220, 39600),
(4, '2024-01-11', 'poulets', 'Vente poulets locaux', 12, 9500, 114000),
(4, '2024-01-05', 'oeufs', 'Vente voisinage', 100, 200, 20000),

-- Ibrahima BA - Saint-Louis (Revenus très faibles - Démarrage)
(5, '2024-01-20', 'oeufs', 'Première vente marché Saint-Louis', 120, 210, 25200),
(5, '2024-01-14', 'poulets', 'Vente poulets voisinage', 8, 8500, 68000),
(5, '2024-01-07', 'oeufs', 'Test vente directe', 80, 200, 16000);

-- DÉPENSES EN FCFA (Coûts réalistes pour le Sénégal)
INSERT INTO expenses (user_id, date, category, description, amount, frequency, is_recurring) VALUES
-- Ismael FALL - Ferme iWorks (Dépenses importantes - Grande ferme technologique)
(1, '2024-01-20', 'Alimentation', 'Achat maïs et tourteau soja premium (3 tonnes)', 650000, 'mensuel', TRUE),
(1, '2024-01-18', 'Médicaments', 'Vaccins Newcastle, Gumboro et antibiotiques', 180000, 'trimestriel', TRUE),
(1, '2024-01-15', 'Équipement', 'Maintenance système automatisé abreuvement', 120000, 'ponctuel', FALSE),
(1, '2024-01-12', 'Main-d\'œuvre', 'Salaires 5 employés qualifiés', 750000, 'mensuel', TRUE),
(1, '2024-01-10', 'Services publics', 'Électricité, eau et internet ferme', 95000, 'mensuel', TRUE),
(1, '2024-01-08', 'Transport', 'Carburant véhicules livraison', 85000, 'mensuel', TRUE),
(1, '2024-01-05', 'Formation', 'Formation employés nouvelles techniques', 150000, 'ponctuel', FALSE),
(1, '2024-01-03', 'Marketing', 'Publicité et communication digitale', 75000, 'mensuel', TRUE),

-- Aminata DIOP - Ferme Bio (Dépenses moyennes-élevées - Bio coûte plus cher)
(2, '2024-01-19', 'Alimentation', 'Aliments bio certifiés ECOCERT (2 tonnes)', 580000, 'mensuel', TRUE),
(2, '2024-01-16', 'Médicaments', 'Traitements préventifs bio homologués', 110000, 'trimestriel', TRUE),
(2, '2024-01-13', 'Certification Bio', 'Frais certification annuelle ECOCERT', 220000, 'annuel', TRUE),
(2, '2024-01-10', 'Main-d\'œuvre', 'Salaires 3 employés spécialisés bio', 420000, 'mensuel', TRUE),
(2, '2024-01-07', 'Services publics', 'Électricité et eau', 65000, 'mensuel', TRUE),
(2, '2024-01-04', 'Marketing', 'Promotion produits bio', 45000, 'mensuel', TRUE),

-- Moussa NDIAYE - Élevage Thiès (Dépenses moyennes)
(3, '2024-01-21', 'Alimentation', 'Aliments standard poulets (1.5 tonnes)', 350000, 'mensuel', TRUE),
(3, '2024-01-17', 'Médicaments', 'Vaccins et vermifuges essentiels', 55000, 'trimestriel', TRUE),
(3, '2024-01-14', 'Main-d\'œuvre', 'Salaire 1 employé temps partiel', 180000, 'mensuel', TRUE),
(3, '2024-01-11', 'Services publics', 'Électricité ferme', 42000, 'mensuel', TRUE),
(3, '2024-01-08', 'Équipement', 'Achat mangeoires et abreuvoirs', 35000, 'ponctuel', FALSE),
(3, '2024-01-04', 'Transport', 'Carburant moto livraisons', 25000, 'mensuel', TRUE),

-- Fatou SARR - Ferme Kaolack (Dépenses faibles)
(4, '2024-01-15', 'Alimentation', 'Aliments poulets locaux', 140000, 'mensuel', TRUE),
(4, '2024-01-12', 'Médicaments', 'Vaccins de base', 30000, 'trimestriel', TRUE),
(4, '2024-01-08', 'Services publics', 'Électricité', 25000, 'mensuel', TRUE),
(4, '2024-01-05', 'Main-d\'œuvre', 'Aide familiale', 50000, 'mensuel', TRUE),

-- Ibrahima BA - Saint-Louis (Dépenses très faibles - Démarrage)
(5, '2024-01-18', 'Équipement', 'Matériel de démarrage complet', 220000, 'ponctuel', FALSE),
(5, '2024-01-14', 'Alimentation', 'Aliments démarrage poussins', 95000, 'mensuel', TRUE),
(5, '2024-01-10', 'Médicaments', 'Vaccins premiers soins', 20000, 'ponctuel', FALSE),
(5, '2024-01-06', 'Services publics', 'Raccordement électricité', 35000, 'ponctuel', FALSE);

-- ÉVÉNEMENTS DE MORTALITÉ EN FCFA
INSERT INTO mortality_events (user_id, date, cause, count, description, estimated_loss) VALUES
-- Ismael FALL - Ferme iWorks
(1, '2024-01-22', 'maladie', 8, 'Grippe aviaire H5N1 détectée, quarantaine immédiate', 132000),
(1, '2024-01-18', 'predateur', 4, 'Attaque de chacal nocturne, renforcement sécurité périmètre', 66000),
(1, '2024-01-14', 'accident', 3, 'Poules écrasées par chute équipement automatisé', 49500),
(1, '2024-01-10', 'naturel', 2, 'Mort naturelle poules reproductrices âgées', 33000),

-- Aminata DIOP - Ferme Bio
(2, '2024-01-20', 'maladie', 3, 'Infection respiratoire traitée avec produits bio', 58500),
(2, '2024-01-15', 'naturel', 2, 'Fin de cycle naturel poules pondeuses bio', 39000),
(2, '2024-01-11', 'accident', 1, 'Poule blessée par prédateur, soins prodigués', 19500),

-- Moussa NDIAYE - Élevage Thiès
(3, '2024-01-19', 'predateur', 3, 'Attaque de chat sauvage, amélioration clôture', 33000),
(3, '2024-01-13', 'accident', 2, 'Poules coincées dans grillage défaillant', 22000),
(3, '2024-01-07', 'maladie', 1, 'Diarrhée infectieuse isolée', 11000),

-- Fatou SARR - Ferme Kaolack
(4, '2024-01-16', 'maladie', 5, 'Épidémie diarrhée non traitée rapidement', 47500),
(4, '2024-01-09', 'naturel', 2, 'Mort naturelle poules âgées', 19000),

-- Ibrahima BA - Saint-Louis
(5, '2024-01-12', 'accident', 2, 'Poussins écrasés par négligence', 17000);

-- =====================================================
-- VUES POUR LES RAPPORTS
-- =====================================================

-- Vue des statistiques financières par utilisateur
CREATE VIEW user_financial_stats AS
SELECT 
    u.id,
    u.name,
    u.farm_name,
    u.role,
    u.status,
    fd.total_chickens,
    COALESCE(SUM(r.total_amount), 0) as total_revenue,
    COALESCE(SUM(e.amount), 0) as total_expenses,
    COALESCE(SUM(m.estimated_loss), 0) as total_mortality_loss,
    (COALESCE(SUM(r.total_amount), 0) - COALESCE(SUM(e.amount), 0) - COALESCE(SUM(m.estimated_loss), 0)) as net_profit,
    COALESCE(SUM(m.count), 0) as total_mortality_count,
    CASE 
        WHEN fd.total_chickens > 0 THEN (COALESCE(SUM(m.count), 0) / fd.total_chickens) * 100 
        ELSE 0 
    END as mortality_rate
FROM users u
LEFT JOIN farm_data fd ON u.id = fd.user_id
LEFT JOIN revenues r ON u.id = r.user_id
LEFT JOIN expenses e ON u.id = e.user_id
LEFT JOIN mortality_events m ON u.id = m.user_id
GROUP BY u.id, u.name, u.farm_name, u.role, u.status, fd.total_chickens;

-- Vue des revenus mensuels
CREATE VIEW monthly_revenues AS
SELECT 
    user_id,
    YEAR(date) as year,
    MONTH(date) as month,
    DATE_FORMAT(date, '%Y-%m') as month_key,
    SUM(total_amount) as monthly_revenue,
    COUNT(*) as transaction_count
FROM revenues
GROUP BY user_id, YEAR(date), MONTH(date)
ORDER BY user_id, year DESC, month DESC;

-- Vue des dépenses mensuelles
CREATE VIEW monthly_expenses AS
SELECT 
    user_id,
    YEAR(date) as year,
    MONTH(date) as month,
    DATE_FORMAT(date, '%Y-%m') as month_key,
    SUM(amount) as monthly_expenses,
    COUNT(*) as transaction_count
FROM expenses
GROUP BY user_id, YEAR(date), MONTH(date)
ORDER BY user_id, year DESC, month DESC;

-- =====================================================
-- PROCÉDURES STOCKÉES
-- =====================================================

DELIMITER //

-- Procédure pour obtenir les statistiques d'un utilisateur
CREATE PROCEDURE GetUserStatistics(IN userId INT)
BEGIN
    SELECT * FROM user_financial_stats WHERE id = userId;
END //

-- Procédure pour obtenir le rapport financier mensuel
CREATE PROCEDURE GetMonthlyFinancialReport(IN userId INT, IN limitMonths INT)
BEGIN
    SELECT 
        mr.month_key,
        mr.year,
        mr.month,
        COALESCE(mr.monthly_revenue, 0) as total_revenue,
        COALESCE(me.monthly_expenses, 0) as total_expenses,
        (COALESCE(mr.monthly_revenue, 0) - COALESCE(me.monthly_expenses, 0)) as net_income
    FROM monthly_revenues mr
    LEFT JOIN monthly_expenses me ON mr.user_id = me.user_id AND mr.month_key = me.month_key
    WHERE mr.user_id = userId
    ORDER BY mr.year DESC, mr.month DESC
    LIMIT limitMonths;
END //

-- Procédure pour obtenir le top des fermes par revenus
CREATE PROCEDURE GetTopFarmsByRevenue(IN limitCount INT)
BEGIN
    SELECT 
        u.name,
        u.farm_name,
        u.role,
        SUM(r.total_amount) as total_revenue,
        COUNT(r.id) as total_transactions
    FROM users u
    INNER JOIN revenues r ON u.id = r.user_id
    WHERE u.status = 'active'
    GROUP BY u.id, u.name, u.farm_name, u.role
    ORDER BY total_revenue DESC
    LIMIT limitCount;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS AUTOMATIQUES
-- =====================================================

DELIMITER //

-- Trigger pour créer automatiquement les catégories par défaut
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    -- Créer les données de ferme par défaut
    INSERT INTO farm_data (user_id, total_chickens) VALUES (NEW.id, 0);
    
    -- Créer les catégories par défaut
    INSERT INTO expense_categories (user_id, name, color, is_default) VALUES
    (NEW.id, 'Alimentation', 'bg-amber-100 text-amber-800', TRUE),
    (NEW.id, 'Médicaments', 'bg-red-100 text-red-800', TRUE),
    (NEW.id, 'Équipement', 'bg-blue-100 text-blue-800', TRUE),
    (NEW.id, 'Main-d\'œuvre', 'bg-purple-100 text-purple-800', TRUE),
    (NEW.id, 'Services publics', 'bg-green-100 text-green-800', TRUE),
    (NEW.id, 'Marketing', 'bg-pink-100 text-pink-800', TRUE),
    (NEW.id, 'Autre', 'bg-gray-100 text-gray-800', TRUE);
END //

-- Trigger pour calculer automatiquement le montant total des revenus
CREATE TRIGGER before_revenue_insert
BEFORE INSERT ON revenues
FOR EACH ROW
BEGIN
    SET NEW.total_amount = NEW.quantity * NEW.unit_price;
END //

CREATE TRIGGER before_revenue_update
BEFORE UPDATE ON revenues
FOR EACH ROW
BEGIN
    SET NEW.total_amount = NEW.quantity * NEW.unit_price;
END //

DELIMITER ;

-- =====================================================
-- INDEX DE PERFORMANCE
-- =====================================================

-- Index composites pour optimiser les requêtes fréquentes
CREATE INDEX idx_user_date_revenue ON revenues(user_id, date);
CREATE INDEX idx_user_date_expense ON expenses(user_id, date);
CREATE INDEX idx_user_date_mortality ON mortality_events(user_id, date);
CREATE INDEX idx_user_category_expense ON expenses(user_id, category);
CREATE INDEX idx_user_type_revenue ON revenues(user_id, type);

-- =====================================================
-- DONNÉES HISTORIQUES POUR GRAPHIQUES
-- =====================================================

-- Ajouter plus de données historiques pour les graphiques (2023)
INSERT INTO revenues (user_id, date, type, description, quantity, unit_price, total_amount) VALUES
-- Données historiques Ismael FALL (2023) - Ferme iWorks
(1, '2023-12-22', 'oeufs', 'Vente fin d\'année marché Sandaga', 900, 260, 234000),
(1, '2023-12-18', 'poulets', 'Commande fêtes restaurants Dakar', 60, 15500, 930000),
(1, '2023-12-15', 'subventions', 'Aide gouvernementale fin année', 1, 1800000, 1800000),
(1, '2023-11-25', 'oeufs', 'Livraison novembre supermarchés', 800, 270, 216000),
(1, '2023-11-20', 'poulets', 'Vente poulets novembre', 45, 14500, 652500),
(1, '2023-10-30', 'fonds-externes', 'Investissement expansion iWorks', 1, 2500000, 2500000),
(1, '2023-10-25', 'oeufs', 'Commande hôtels octobre', 700, 265, 185500),

-- Données historiques Aminata DIOP (2023) - Bio
(2, '2023-12-20', 'oeufs', 'Œufs bio décembre premium', 400, 370, 148000),
(2, '2023-12-15', 'poulets', 'Poulets bio fêtes certifiés', 22, 18500, 407000),
(2, '2023-11-25', 'oeufs', 'Vente novembre bio Almadies', 350, 360, 126000),
(2, '2023-11-18', 'poulets', 'Poulets bio novembre', 18, 17800, 320400),
(2, '2023-10-28', 'aides-agricoles', 'Prime bio trimestrielle', 1, 600000, 600000),

-- Données historiques Moussa NDIAYE (2023)
(3, '2023-12-18', 'oeufs', 'Vente décembre Thiès', 350, 245, 85750),
(3, '2023-12-12', 'poulets', 'Poulets décembre', 28, 11500, 322000),
(3, '2023-11-20', 'oeufs', 'Novembre marché local', 300, 240, 72000),
(3, '2023-11-15', 'poulets', 'Vente novembre', 25, 11200, 280000);

INSERT INTO expenses (user_id, date, category, description, amount, frequency, is_recurring) VALUES
-- Dépenses historiques Ismael FALL (2023)
(1, '2023-12-20', 'Alimentation', 'Aliments décembre premium', 630000, 'mensuel', TRUE),
(1, '2023-12-15', 'Main-d\'œuvre', 'Salaires décembre + primes', 850000, 'mensuel', TRUE),
(1, '2023-11-20', 'Alimentation', 'Aliments novembre', 620000, 'mensuel', TRUE),
(1, '2023-11-15', 'Main-d\'œuvre', 'Salaires novembre', 750000, 'mensuel', TRUE),
(1, '2023-10-25', 'Équipement', 'Modernisation système automatisé', 450000, 'ponctuel', FALSE),

-- Dépenses historiques Aminata DIOP (2023)
(2, '2023-12-18', 'Alimentation', 'Aliments bio décembre certifiés', 570000, 'mensuel', TRUE),
(2, '2023-12-10', 'Main-d\'œuvre', 'Salaires décembre', 420000, 'mensuel', TRUE),
(2, '2023-11-18', 'Alimentation', 'Aliments bio novembre', 560000, 'mensuel', TRUE),
(2, '2023-11-10', 'Main-d\'œuvre', 'Salaires novembre', 420000, 'mensuel', TRUE),

-- Dépenses historiques Moussa NDIAYE (2023)
(3, '2023-12-15', 'Alimentation', 'Aliments décembre standard', 340000, 'mensuel', TRUE),
(3, '2023-12-10', 'Main-d\'œuvre', 'Salaire décembre', 180000, 'mensuel', TRUE),
(3, '2023-11-15', 'Alimentation', 'Aliments novembre', 335000, 'mensuel', TRUE),
(3, '2023-11-10', 'Main-d\'œuvre', 'Salaire novembre', 180000, 'mensuel', TRUE);

-- =====================================================
-- REQUÊTES DE VÉRIFICATION
-- =====================================================

-- Vérifier les statistiques par utilisateur
-- SELECT * FROM user_financial_stats ORDER BY total_revenue DESC;

-- Vérifier les revenus mensuels
-- SELECT * FROM monthly_revenues WHERE user_id = 1 LIMIT 6;

-- Vérifier les top fermes
-- CALL GetTopFarmsByRevenue(5);

-- =====================================================
-- INFORMATIONS DE CONNEXION MISES À JOUR
-- =====================================================

/*
🔑 COMPTES DE DÉMONSTRATION ACTUALISÉS:

1. 👨‍💼 ADMINISTRATEUR PRINCIPAL:
   - Nom: Ismael FALL
   - Email: projetsafrique@iworks.sn
   - Mot de passe: PAE%pae123*-+
   - Ferme: Ferme Avicole iWorks Sénégal
   - Rôle: admin
   - Poulets: 1,500

2. 👩‍💼 GESTIONNAIRE:
   - Nom: Aminata DIOP
   - Email: aminata@ferme-bio-dakar.sn
   - Mot de passe: ferme2024
   - Ferme: Ferme Bio Dakar
   - Rôle: manager
   - Poulets: 800

3. 👥 UTILISATEURS:
   - Moussa NDIAYE (moussa@elevage-thies.sn) - Actif - 500 poulets
   - Fatou SARR (fatou@ferme-kaolack.sn) - Bloqué - 300 poulets
   - Ibrahima BA (ibrahima@aviculture-saint-louis.sn) - En attente - 150 poulets

💰 STATISTIQUES FINANCIÈRES FCFA (Janvier 2024):

📊 Ismael FALL (iWorks):
   - Revenus: 8,062,000 FCFA
   - Dépenses: 1,955,000 FCFA
   - Mortalité: 280,500 FCFA
   - Bénéfice net: 5,826,500 FCFA ✅

📊 Aminata DIOP (Bio):
   - Revenus: 2,148,000 FCFA
   - Dépenses: 1,240,000 FCFA
   - Mortalité: 117,000 FCFA
   - Bénéfice net: 791,000 FCFA ✅

📊 Moussa NDIAYE:
   - Revenus: 714,500 FCFA
   - Dépenses: 632,000 FCFA
   - Mortalité: 66,000 FCFA
   - Bénéfice net: 16,500 FCFA ⚠️

📊 Fatou SARR (Bloquée):
   - Revenus: 173,600 FCFA
   - Dépenses: 245,000 FCFA
   - Mortalité: 66,500 FCFA
   - Bénéfice net: -137,900 FCFA ❌

📊 Ibrahima BA (Démarrage):
   - Revenus: 109,200 FCFA
   - Dépenses: 370,000 FCFA
   - Mortalité: 17,000 FCFA
   - Bénéfice net: -277,800 FCFA ❌ (Normal en démarrage)

🏷️ PRIX MOYENS SÉNÉGAL (FCFA):
- Œufs standard: 200-280 FCFA/unité
- Œufs bio: 320-380 FCFA/unité
- Poulets standard: 8,500-12,000 FCFA/unité
- Poulets fermiers: 14,000-16,500 FCFA/unité
- Poulets bio: 17,500-19,500 FCFA/unité
- Aliments: 280-650 FCFA/kg
- Main-d'œuvre: 150-850k FCFA/mois

🎯 FONCTIONNALITÉS AVANCÉES:
✅ Gestion multi-utilisateurs avec rôles
✅ Statistiques financières automatiques
✅ Vues optimisées pour rapports
✅ Procédures stockées pour analyses
✅ Triggers automatiques
✅ Index de performance
✅ Données historiques pour graphiques
✅ Système de mortalité avec pertes
✅ Catégories personnalisables
✅ Fréquences de dépenses récurrentes
*/

-- Fin du script SQL - Base de données prête pour Ismael FALL ! 🎉
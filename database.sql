-- TaskFlowDB Database Initialization Script

-- 1. Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TaskFlowDB')
BEGIN
    CREATE DATABASE TaskFlowDB;
END
GO

USE TaskFlowDB;
GO

-- 2. Create Tables

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(150) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Categories Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE Categories (
        Id INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Categories_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END
GO

-- Tasks Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tasks]') AND type in (N'U'))
BEGIN
    CREATE TABLE Tasks (
        Id INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        Priority NVARCHAR(20) NOT NULL,
        Deadline DATETIME2 NULL,
        StartDate DATETIME2 NULL,
        Category NVARCHAR(100),
        EstimatedMinutes INT NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'Pending',
        ReminderMinutes INT NULL,
        Recurrence NVARCHAR(20) NOT NULL DEFAULT 'One-time',
        ReminderAt DATETIME2 NULL,
        PriorityScore INT,
        DeadlineScore INT,
        TotalScore INT,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        CompletedAt DATETIME2 NULL,
        CONSTRAINT FK_Tasks_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END
GO

-- Notifications Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE Notifications (
        Id INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL,
        TaskId INT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        IsRead BIT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_Notifications_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE SET NULL
    );
END
GO

-- NotificationHistory Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationHistory]') AND type in (N'U'))
BEGIN
    CREATE TABLE NotificationHistory (
        Id INT PRIMARY KEY IDENTITY(1,1),
        TaskId INT NOT NULL,
        ReminderType NVARCHAR(50),
        SentAt DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_NotificationHistory_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE
    );
END
GO

-- 3. Create Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_UserId' AND object_id = OBJECT_ID('Tasks'))
    CREATE INDEX IX_Tasks_UserId ON Tasks(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_Deadline' AND object_id = OBJECT_ID('Tasks'))
    CREATE INDEX IX_Tasks_Deadline ON Tasks(Deadline);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_Status' AND object_id = OBJECT_ID('Tasks'))
    CREATE INDEX IX_Tasks_Status ON Tasks(Status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_Priority' AND object_id = OBJECT_ID('Tasks'))
    CREATE INDEX IX_Tasks_Priority ON Tasks(Priority);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_UserId' AND object_id = OBJECT_ID('Notifications'))
    CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
GO

-- 4. Ensure task delete works cleanly with related notification rows
-- Safe to re-run on existing databases
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Notifications_Tasks')
BEGIN
    ALTER TABLE Notifications DROP CONSTRAINT FK_Notifications_Tasks;
END
GO

ALTER TABLE Notifications
ADD CONSTRAINT FK_Notifications_Tasks
FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE SET NULL;
GO

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_NotificationHistory_Tasks')
BEGIN
    ALTER TABLE NotificationHistory DROP CONSTRAINT FK_NotificationHistory_Tasks;
END
GO

ALTER TABLE NotificationHistory
ADD CONSTRAINT FK_NotificationHistory_Tasks
FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE;
GO

-- 4b. Add recurrence + reminder datetime for existing databases
IF COL_LENGTH('dbo.Tasks', 'Recurrence') IS NULL
BEGIN
    ALTER TABLE Tasks ADD Recurrence NVARCHAR(20) NOT NULL CONSTRAINT DF_Tasks_Recurrence DEFAULT 'One-time';
END
GO

IF COL_LENGTH('dbo.Tasks', 'ReminderAt') IS NULL
BEGIN
    ALTER TABLE Tasks ADD ReminderAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Tasks', 'Category') IS NOT NULL
BEGIN
    ALTER TABLE Tasks ALTER COLUMN Category NVARCHAR(100) NULL;
END
GO

-- 5. Sample Data for a Demo User (Optional execution)
-- Replace the password hash with a valid bcrypt hash if you want to test login directly.
-- The password hash here corresponds to "password123".
/*
INSERT INTO Users (Name, Email, PasswordHash) 
VALUES ('Demo User', 'demo@taskflow.com', '$2a$10$tZ8nE/5P0pX6gD/Wd4J5c.Zt2U/9YnL/v6qY.H.bH6F/4xY9u/gGq');

DECLARE @DemoUserId INT = SCOPE_IDENTITY();

INSERT INTO Categories (UserId, Name) VALUES (@DemoUserId, 'College'), (@DemoUserId, 'Project'), (@DemoUserId, 'Personal'), (@DemoUserId, 'Work'), (@DemoUserId, 'Other');

INSERT INTO Tasks (UserId, Title, Description, Priority, Deadline, Category, EstimatedMinutes, Status, PriorityScore, DeadlineScore, TotalScore)
VALUES 
(@DemoUserId, 'Complete DBMS Assignment', 'Normalization and ER Diagrams', 'High', DATEADD(day, 1, GETDATE()), 'College', 120, 'Pending', 3, 4, 7),
(@DemoUserId, 'Deep Learning Presentation', 'Slides for chapter 4', 'High', DATEADD(day, 5, GETDATE()), 'College', 180, 'Pending', 3, 2, 5),
(@DemoUserId, 'Update Portfolio', 'Add React projects', 'Medium', DATEADD(day, 10, GETDATE()), 'Personal', 60, 'Pending', 2, 1, 3),
(@DemoUserId, 'Buy Books', 'Purchase semester books', 'Low', DATEADD(day, 20, GETDATE()), 'Other', 30, 'Pending', 1, 1, 2),
(@DemoUserId, 'Prepare React Project Demo', 'TaskFlow demo', 'Critical', DATEADD(day, 2, GETDATE()), 'Project', 90, 'Pending', 4, 3, 7);
*/
GO

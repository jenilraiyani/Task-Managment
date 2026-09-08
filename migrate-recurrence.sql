-- Run this on existing TaskFlowDB to enable recurrence + handwritten category
USE TaskFlowDB;
GO

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

-- Initial database setup for Tecno Gamerz Hub
-- This file is executed when the PostgreSQL container starts for the first time

-- Create the main database (already created by POSTGRES_DB env var)
-- CREATE DATABASE tecno_gamerz_hub;

-- Create additional users or configurations if needed
-- For now, we'll use the default postgres user

-- Enable extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';
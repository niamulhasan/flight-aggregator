# Phase 1: Project Setup & Infrastructure Plan

## Description
This phase covers the initial project setup, Docker infrastructure, and core framework configuration.

## Clean Architecture Context
This phase establishes the foundation for our Clean Architecture implementation. All future work will build on this structure.
* Reference: [Clean Architecture Constitution](constitutions/clean_architecture.md)

## Prerequisites
- [ ] Node.js 18+ installed on development machine
- [ ] Docker and Docker Compose installed
- [ ] Git (optional but recommended)

## Task Order
Execute tasks in this exact order:
1. Task 1.1: Initialize NestJS Project Structure
2. Task 1.2: Set Up Docker Compose Configuration
3. Task 1.3: Configure NestJS with TypeORM and PostgreSQL
4. Task 1.4: Set Up Swagger/OpenAPI Documentation
5. Task 1.5: Configure Environment Variables and Validation

---

## Task 1.1: Initialize NestJS Project Structure

### Details
**Project Root**: `flight-search/`

### Implementation Steps
1. [ ] Create project root directories:
   - `flight-search/` (main NestJS application)
   - `provider-a/` (mock Provider A)
   - `provider-b/` (mock Provider B)
   - `provider-c/` (mock Provider C)

2. [ ] Initialize NestJS app in `flight-search/`:
   ```bash
   cd flight-search
   npx @nestjs/cli new . --package-manager npm --strict
   ```

3. [ ] Set up Clean Architecture folder structure in `flight-search/src/`:
   ```
   src/
   ├── domain/              # Entities & domain services (inner layer)
   │   ├── entities/
   │   ├── value-objects/
   │   └── services/
   ├── application/         # Use cases & application services
   │   ├── use-cases/
   │   └── services/
   ├── infrastructure/      # Adapters, repositories, providers
   │   ├── providers/
   │   └── repositories/
   ├── interface/           # Controllers, DTOs, presenters
   │   ├── controllers/
   │   └── dtos/
   └── app.module.ts
   ```

4. [ ] Create `.gitignore` file at project root:
   ```gitignore
   # Dependencies
   node_modules/

   # Build outputs
   dist/
   build/

   # Environment files
   .env
   .env.local
   .env.*.local

   # Logs
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # IDE
   .idea/
   .vscode/
   *.swp
   *.swo

   # OS
   .DS_Store
   Thumbs.db

   # Docker
   docker-compose.override.yml
   ```

### Validation
- [ ] All directories created at correct paths
- [ ] NestJS project initialized with strict TypeScript
- [ ] `.gitignore` file exists with standard exclusions

---

## Task 1.2: Set Up Docker Compose Configuration

### File Paths
- Main Compose File: `docker-compose.yml`
- Main App Dockerfile: `flight-search/Dockerfile`
- Provider Dockerfiles: `provider-a/Dockerfile`, `provider-b/Dockerfile`, `provider-c/Dockerfile`

### Implementation Steps
1. [ ] Create `docker-compose.yml` at project root:
   ```yaml
   version: '3.8'

   services:
     # Main Flight Search Application
     flight-search-app:
       build:
         context: ./flight-search
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=development
         - PORT=3000
         - DB_HOST=postgres
         - DB_PORT=5432
         - DB_USERNAME=postgres
         - DB_PASSWORD=postgres
         - DB_NAME=flight_search
         - PROVIDER_A_URL=http://provider-a:3001
         - PROVIDER_B_URL=http://provider-b:3002
         - PROVIDER_C_URL=http://provider-c:3003
       depends_on:
         - postgres
       networks:
         - flight-network
       restart: unless-stopped

     # Mock Provider A
     provider-a:
       build:
         context: ./provider-a
         dockerfile: Dockerfile
       ports:
         - "3001:3001"
       environment:
         - PORT=3001
       networks:
         - flight-network
       restart: unless-stopped

     # Mock Provider B
     provider-b:
       build:
         context: ./provider-b
         dockerfile: Dockerfile
       ports:
         - "3002:3002"
       environment:
         - PORT=3002
       networks:
         - flight-network
       restart: unless-stopped

     # Mock Provider C
     provider-c:
       build:
         context: ./provider-c
         dockerfile: Dockerfile
       ports:
         - "3003:3003"
       environment:
         - PORT=3003
       networks:
         - flight-network
       restart: unless-stopped

     # PostgreSQL Database
     postgres:
       image: postgres:15-alpine
       ports:
         - "5432:5432"
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=postgres
         - POSTGRES_DB=flight_search
       volumes:
         - postgres_data:/var/lib/postgresql/data
       networks:
         - flight-network
       restart: unless-stopped

   volumes:
     postgres_data:

   networks:
     flight-network:
       driver: bridge
   ```

2. [ ] Create `flight-search/Dockerfile`:
   ```dockerfile
   FROM node:18-alpine AS builder

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   FROM node:18-alpine AS production

   WORKDIR /app

   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/dist ./dist
   COPY package*.json ./

   EXPOSE 3000

   CMD ["npm", "run", "start:prod"]
   ```

3. [ ] Create simple Dockerfiles for providers (e.g., `provider-a/Dockerfile`):
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .

   EXPOSE 3001

   CMD ["npm", "start"]
   ```
   *Repeat for provider-b and provider-c, changing EXPOSE ports to 3002 and 3003 respectively*

4. [ ] Create `.env.example` at project root:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=flight_search

   # Provider URLs (for local development)
   PROVIDER_A_URL=http://localhost:3001
   PROVIDER_B_URL=http://localhost:3002
   PROVIDER_C_URL=http://localhost:3003
   ```

### Validation
- [ ] `docker-compose.yml` defines all 5 services
- [ ] All Dockerfiles created at correct paths
- [ ] `.env.example` file exists with all required variables
- [ ] Services configured to communicate on the same Docker network

---

## Task 1.3: Configure NestJS with TypeORM and PostgreSQL

### File Paths
- Package dependencies: `flight-search/package.json`
- App Module: `flight-search/src/app.module.ts`
- Main Config: `flight-search/src/config/database.config.ts`

### Implementation Steps
1. [ ] Install required dependencies in `flight-search/`:
   ```bash
   cd flight-search
   npm install @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer
   npm install --save-dev @types/pg
   ```

2. [ ] Create `flight-search/src/config/database.config.ts`:
   ```typescript
   import { registerAs } from '@nestjs/config';

   export default registerAs('database', () => ({
     type: 'postgres',
     host: process.env.DB_HOST || 'localhost',
     port: parseInt(process.env.DB_PORT, 10) || 5432,
     username: process.env.DB_USERNAME || 'postgres',
     password: process.env.DB_PASSWORD || 'postgres',
     database: process.env.DB_NAME || 'flight_search',
     entities: ['dist/**/*.entity{.ts,.js}'],
     synchronize: process.env.NODE_ENV === 'development',
     migrations: ['dist/migrations/*{.ts,.js}'],
     migrationsRun: true,
     logging: process.env.NODE_ENV === 'development',
   }));
   ```

3. [ ] Update `flight-search/src/app.module.ts`:
   ```typescript
   import { Module } from '@nestjs/common';
   import { ConfigModule } from '@nestjs/config';
   import { TypeOrmModule } from '@nestjs/typeorm';
   import databaseConfig from './config/database.config';

   @Module({
     imports: [
       ConfigModule.forRoot({
         isGlobal: true,
         load: [databaseConfig],
       }),
       TypeOrmModule.forRootAsync({
         useFactory: () => databaseConfig(),
       }),
     ],
   })
   export class AppModule {}
   ```

### Validation
- [ ] All dependencies installed
- [ ] Database config file created
- [ ] `AppModule` imports ConfigModule and TypeOrmModule
- [ ] TypeORM configured to connect to PostgreSQL

---

## Task 1.4: Set Up Swagger/OpenAPI Documentation

### File Paths
- Main File: `flight-search/src/main.ts`

### Implementation Steps
1. [ ] Install Swagger dependencies in `flight-search/`:
   ```bash
   cd flight-search
   npm install @nestjs/swagger swagger-ui-express
   ```

2. [ ] Update `flight-search/src/main.ts`:
   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { ValidationPipe } from '@nestjs/common';
   import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
   import { AppModule } from './app.module';

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);

     // Enable validation for all DTOs
     app.useGlobalPipes(new ValidationPipe({
       whitelist: true,
       forbidNonWhitelisted: true,
       transform: true,
     }));

     // Set up Swagger
     const config = new DocumentBuilder()
       .setTitle('Flight Search Aggregator API')
       .setDescription('API for searching flights across multiple providers and managing bookings')
       .setVersion('1.0')
       .addTag('flights', 'Flight search operations')
       .addTag('bookings', 'Booking management operations')
       .build();

     const document = SwaggerModule.createDocument(app, config);
     SwaggerModule.setup('api/docs', app, document, {
       swaggerOptions: {
         persistAuthorization: true,
       },
     });

     const port = parseInt(process.env.PORT, 10) || 3000;
     await app.listen(port);
     console.log(`Application is running on: http://localhost:${port}`);
     console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
   }

   bootstrap();
   ```

### Validation
- [ ] Swagger dependencies installed
- [ ] `main.ts` updated with Swagger configuration
- [ ] Swagger UI path set to `/api/docs`
- [ ] Global validation pipe configured

---

## Task 1.5: Configure Environment Variables and Validation

### File Paths
- Environment Schema: `flight-search/src/config/env.validation.ts`

### Implementation Steps
1. [ ] Create `flight-search/src/config/env.validation.ts`:
   ```typescript
   import { plainToInstance } from 'class-transformer';
   import { IsEnum, IsInt, IsString, Min, validateSync } from 'class-validator';

   enum Environment {
     Development = 'development',
     Production = 'production',
     Test = 'test',
   }

   class EnvironmentVariables {
     @IsEnum(Environment)
     NODE_ENV: Environment = Environment.Development;

     @IsInt()
     @Min(1)
     PORT: number = 3000;

     @IsString()
     DB_HOST: string;

     @IsInt()
     @Min(1)
     DB_PORT: number;

     @IsString()
     DB_USERNAME: string;

     @IsString()
     DB_PASSWORD: string;

     @IsString()
     DB_NAME: string;

     @IsString()
     PROVIDER_A_URL: string;

     @IsString()
     PROVIDER_B_URL: string;

     @IsString()
     PROVIDER_C_URL: string;
   }

   export function validate(config: Record<string, unknown>) {
     const validatedConfig = plainToInstance(
       EnvironmentVariables,
       config,
       { enableImplicitConversion: true },
     );
     const errors = validateSync(validatedConfig, {
       skipMissingProperties: false,
     });

     if (errors.length > 0) {
       throw new Error(errors.toString());
     }
     return validatedConfig;
   }
   ```

2. [ ] Update `flight-search/src/app.module.ts` to use validation:
   ```typescript
   import { Module } from '@nestjs/common';
   import { ConfigModule } from '@nestjs/config';
   import { TypeOrmModule } from '@nestjs/typeorm';
   import databaseConfig from './config/database.config';
   import { validate } from './config/env.validation';

   @Module({
     imports: [
       ConfigModule.forRoot({
         isGlobal: true,
         load: [databaseConfig],
         validate,
       }),
       TypeOrmModule.forRootAsync({
         useFactory: () => databaseConfig(),
       }),
     ],
   })
   export class AppModule {}
   ```

3. [ ] Create a `.env` file in `flight-search/` by copying `.env.example` (remember to update DB_HOST to `localhost` for local development)

### Validation
- [ ] Environment validation schema created
- [ ] `AppModule` updated to validate env vars
- [ ] `.env` file exists (copied from `.env.example`)
- [ ] Application will fail fast if required env vars are missing

---

## Success Criteria
- [ ] Project structure created with Clean Architecture folders
- [ ] Docker Compose file defines all 5 services (app, 3 providers, PostgreSQL)
- [ ] NestJS app configured with TypeORM and PostgreSQL
- [ ] Swagger documentation set up and accessible at `/api/docs`
- [ ] Environment variables validated on application startup
- [ ] All files created at correct paths
- [ ] Can run `docker-compose up --build` successfully

---

## Manual Testing Workflow (AI Executes This!)

**The AI agent will follow this exact workflow every time testing is needed!**

### Step 1: Clean Up
```bash
cd /Users/niamulhasan/DEVELOPMENTS/assignment/flight-search
docker-compose down --volumes --remove-orphans
# OR
docker compose down --volumes --remove-orphans
```

### Step 2: Build & Start (Detached Mode)
```bash
docker-compose up --build -d
# OR
docker compose up --build -d
```

### Step 3: Wait for Services & Verify
- Check that all 5 containers are running
- Verify services respond at their URLs

---
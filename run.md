# Instrukcja uruchomienia projektu Blog App

## Wersja niezabezpieczona (`unsecured`)

### 1. Uruchomienie bazy danych

```bash
cd unsecured
docker-compose up -d
```

### 2. Utworzenie pliku .env

```env
PORT=3000
SECRET_KEY=secret
EXPIRE_TIME=900000
```

### 3. Uruchomienie backendu

```bash
cd backend
npm install
npm run start:dev
```

### 4. Uruchomienie frontendu

```bash
cd ../frontend
npm install
ng serve -o
```

## Wersja zabezpieczona (`secured`)

### 1. Uruchomienie bazy danych

```bash
cd secured
docker-compose up -d
```

### 2. Utworzenie pliku .env

```env
PORT=3000
SECRET_KEY=secret
EXPIRE_TIME=900000
```

### 3. Uruchomienie backendu

```bash
cd backend
npm install
npm run start:dev
```

### 4. Uruchomienie frontendu

```bash
cd ../frontend
npm install
ng serve -o
```

### Reset bazy danych

```bash
docker-compose down -v
```

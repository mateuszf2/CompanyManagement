# pai2024

## Pobranie/aktualizacja projektu

Pobranie ostatniej wersji do nowego katalogu ``pai2024``
```
git clone https://gitlab.com/mariusz.jarocki/pai2024.git
```
Aktualizacja posiadanego kodu do ostatniej wersji
```
cd pai2024
git reset
git pull
```

## Instalacja zależności
```
npm install
cd pai2024-vue
npm install
```

## Uruchomienie backendu
```
npm start
```
Backend będzie dostępny pod adresem http://localhost:8000

## Kompilacja frontendu do wersji produkcyjnej
```
cd pai2024-vue
npm run build
```

## Uruchomienie serwera frontendu developerskiego
```
cd pai2024-vue
npm run dev
```
Serwer będzie dostępny pod adresem http://localhost:5173
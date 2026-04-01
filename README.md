## Installation

### Dépendances

- Python 3.14
  - S'assurer que le chemin vers le dossier des scripts python (`path/to/your/python/Scripts`) soit dans le PATH
- mysql-client (ou libmysqlclient)

### Passer en virtual env

- Créer l'env: `python3.14 -m venv .venv`

- Activer l'env: `.venv\Scripts\activate.bat` OU `source .venv/bin/activate`

### Installer les dépendance du projet

- Dans le root, `pip install -r ./requirements.txt`

### Activez ou créez le container mysql

- Pour créer le container : `docker run --name wyrdfolk-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=wyrdfolk -p 3306:3306 -d mysql:8.0`

### Mettre en place la DB

- Migrer la base de donnée : `python manage.py migrate`
- Créer le superuser : `python manage.py createsuperuser`(Peu importe pour le username et le password)

### Lancer le site en local

- lancer à la fois le serveur de dev et Tailwind: `python manage.py tailwind dev`
- lancer le serveur uniquement: `python manage.py runserver`
- lancer Tailwind uniquement: `python manage.py tailwind start`

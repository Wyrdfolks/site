## Installation

S'assurer que le chemin vers le dossier des scripts python (`path/to/your/python/Scripts`) soit dans le PATH

### Passer en virtual env

- Créer l'env: `py -m venv env`

- Activer l'env: `env\Scripts\activate.bat` OU `env\Scripts\activate.ps1`

### Installer les dépendance du projet

- Dans le root, `pip install -r ./requirements.txt`

### Mettre en place la DB

`python manage.py migrate`

### Lancer le site en local

`python manage.py runserver`

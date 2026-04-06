from fabric import Connection, task
from datetime import datetime
import requests
import io
import paramiko
import os

# CONFIG
HOST = os.environ.get("DEPLOY_HOST")
USER = os.environ.get("DEPLOY_USER")
ACCOUNT = os.environ.get("DEPLOY_ACCOUNT")
SITE_ID = os.environ.get("DEPLOY_SITE_ID")
ENV = os.environ.get("DEPLOY_ENV")
SSH_KEY = os.environ.get("SSH_KEY")
REPO_URL = f"https://{os.environ.get('GITHUB_TOKEN')}@github.com/Wyrdfolks/site.git"
DEPLOY_PATH = f"/home/{ACCOUNT}/{ENV}"
ENV_TO_BRANCH = {"dev": "ben/deployV2", "prod": "main"}
BRANCH = ENV_TO_BRANCH.get(ENV)
KEEP_RELEASES = 5


# HELPERS
def get_connection():
    pkey = paramiko.Ed25519Key.from_private_key(io.StringIO(SSH_KEY))
    return Connection(
        host=HOST,
        user=USER,
        connect_kwargs={"pkey": pkey}
    )


def releases_path():
    return f"{DEPLOY_PATH}/releases"


def shared_path():
    return f"{DEPLOY_PATH}/shared"


def current_path():
    return f"{DEPLOY_PATH}/current"


# TASKS
@task
def deploy(ctx):
    """Déploiement complet avec rollback automatique en cas d'erreur."""
    release_name = datetime.now().strftime("%Y%m%d_%H%M%S")
    release_path = f"{releases_path()}/{release_name}"

    with get_connection() as c:
        try:
            print(f"🚀 Déploiement de la release {release_name}...")

            c.run(f"git clone --depth=1 --branch {BRANCH} {REPO_URL} {release_path}", hide="both")

            c.run(f"ln -sfn {shared_path()}/.env        {release_path}/.env")
            c.run(f"ln -sfn {shared_path()}/media       {release_path}/media")

            venv = f"{shared_path()}/venv"
            c.run(f"{venv}/bin/pip install -r {release_path}/requirements.txt --quiet")

            manage = f"{venv}/bin/python {release_path}/manage.py"
            c.run(f"{manage} migrate --noinput")
            c.run(f"{manage} collectstatic --noinput")

            c.run(f"ln -sfn {release_path} {current_path()}")

            reload_server(c)
            cleanup(c)

            print("✅ Déploiement réussi !")

        except Exception as e:
            print(f"💥 Erreur : {e}")
            print("⏪ Rollback en cours...")
            rollback(ctx)
            c.run(f"rm -rf {release_path}")
            raise SystemExit(1)


@task
def rollback(ctx):
    """Revenir à la release précédente."""
    with get_connection() as c:
        # Liste les releases triées par date (la plus récente en dernier)
        result = c.run(f"ls -1t {releases_path()}", hide=True)
        releases = result.stdout.strip().splitlines()

        if len(releases) < 2:
            print("❌ Pas de release précédente disponible.")
            raise SystemExit(1)

        # La release courante est la première, on prend la suivante
        previous = releases[1]
        previous_path = f"{releases_path()}/{previous}"

        print(f"⏪ Rollback vers {previous}...")
        c.run(f"ln -sfn {previous_path} {current_path()}")
        reload_server(c)
        print(f"✅ Rollback effectué vers {previous}")

@task
def releases_list(ctx):
    """Lister les releases disponibles."""
    with get_connection() as c:
        result = c.run(f"ls -1t {releases_path()}", hide=True)
        releases = result.stdout.strip().splitlines()

        result_current = c.run(f"readlink {current_path()}", hide=True)
        current = result_current.stdout.strip().split("/")[-1]

        print("\n📦 Releases disponibles :")
        for r in releases:
            marker = " ← current" if r == current else ""
            print(f"  {r}{marker}")


@task
def setup(ctx):
    """Initialisation de la structure sur le serveur (à lancer une seule fois)."""
    with get_connection() as c:
        for path in [releases_path(), shared_path(), f"{shared_path()}/media"]:
            c.run(f"mkdir -p {path}")
        c.run(
            f"{shared_path()}/venv/bin/python --version || python3 -m venv {shared_path()}/venv"
        )
        print("✅ Structure initialisée. Pense à déposer ton .env dans", shared_path())


def reload_server(c):
    """Recharge le serveur web."""
    API_KEY = os.environ.get("WFS_API_KEY")

    response = requests.post(
        f"https://api.alwaysdata.com/v1/site/{SITE_ID}/restart/",
        auth=(f"{API_KEY} account={ACCOUNT}", ""),
    )
    if response.status_code == 204:
        print("✅ Server reloaded via alwaysdata API")
    else:
        raise Exception(f"Reload failed: {response.status_code} {response.text}")


def cleanup(c):
    """Supprime les releases au-delà du nombre à conserver."""
    result = c.run(f"ls -1t {releases_path()}", hide=True)
    releases = result.stdout.strip().splitlines()
    to_delete = releases[KEEP_RELEASES:]
    for r in to_delete:
        c.run(f"rm -rf {releases_path()}/{r}")
        print(f"🗑  Release supprimée : {r}")

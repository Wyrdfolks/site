import json

from django.core.management.base import BaseCommand
from wagtail.models import Page, Site

from core.models import (
    SocialMediaLink,
    Guest,
    Monde,
    AProposPage,
    FAQPage,
    ProgrammationPage,
    HeaderSettings,
    HeaderNavBarLeftLink,
    HeaderNavBarRightLink,
    HeaderNavMenuTopLink,
    HeaderNavMenuBottomLink,
    FooterSettings,
    FooterSocialLink,
    FooterPageLink,
)
from home.models import HomePage


class Command(BaseCommand):
    help = "Seed la base de données avec le contenu du design Wyrd"

    def handle(self, *args, **options):
        self.stdout.write("Seeding de la base de données Wyrd...")

        # ── Snippets : Social Media ──
        self.stdout.write("  Création des liens social media...")
        socials_data = [
            ("Facebook", "https://facebook.com/wyrdfestival", "facebook"),
            ("Instagram", "https://instagram.com/wyrdfestival", "instagram"),
            ("WhatsApp", "https://wa.me/wyrdfestival", "other"),
            ("YouTube", "https://youtube.com/@wyrdfestival", "youtube"),
            ("Threads", "https://threads.net/@wyrdfestival", "other"),
            ("TikTok", "https://tiktok.com/@wyrdfestival", "tiktok"),
            ("Twitch", "https://twitch.tv/wyrdfestival", "other"),
            ("Discord", "https://discord.gg/wyrdfestival", "discord"),
        ]
        socials = {}
        for name, url, platform in socials_data:
            obj, _ = SocialMediaLink.objects.get_or_create(
                name=name,
                defaults={"url": url, "platform_type": platform},
            )
            socials[name] = obj

        # ── Snippets : Guests ──
        self.stdout.write("  Création des invités...")
        guests_data = [
            (
                "Invité 1",
                "Sur Scène - Actual Play",
                "Une table culte, transposée à WYRD pour une soirée unique.",
            ),
            (
                "Invité 2",
                "Sur Scène - Actual Play",
                "Une table culte, transposée à WYRD pour une soirée unique.",
            ),
            (
                "Invité 3",
                "Sur Scène - Actual Play",
                "Une table culte, transposée à WYRD pour une soirée unique.",
            ),
            (
                "Invité 4",
                "Sur Scène - Actual Play",
                "Une table culte, transposée à WYRD pour une soirée unique.",
            ),
            (
                "Invité 5",
                "Sur Scène - Actual Play",
                "Une table culte, transposée à WYRD pour une soirée unique.",
            ),
        ]
        guests = []
        for title, subtitle, desc in guests_data:
            obj, _ = Guest.objects.get_or_create(
                title=title,
                defaults={"subtitle": subtitle, "description": f"<p>{desc}</p>"},
            )
            guests.append(obj)

        # ── Snippets : Mondes ──
        self.stdout.write("  Création des mondes (espaces)...")
        mondes_data = [
            (
                "La Scène",
                "Des histoires se créent en direct. Tu regardes, tu votes, tu influes. Temps forts, actual plays, grand show du soir.",
                "Voir le programme",
                "https://example.com/programme",
            ),
            (
                "Les Tables",
                "Joue ta première aventure. 45 min. Zéro préparation. Ou test de nouveaux jeux sur des sessions longues.",
                "Réserver une table longue",
                "https://example.com/tables",
            ),
            (
                "L'Espace Famille",
                "Une aventure familiale. Parties adaptées dès 6 ans.",
                "Voir le programme",
                "https://example.com/programme",
            ),
            (
                "Le Hub",
                "Le cœur social du festival. Micro-jeux, pauses, point de rencontre solo.",
                "Voir le programme",
                "https://example.com/programme",
            ),
            (
                "Stands & Soirée",
                "Découvre les jeux, rencontre les créateurs. Assister à une soirée exceptionnelle.",
                "Voir le programme",
                "https://example.com/programme",
            ),
        ]
        mondes = []
        for title, desc, cta_text, cta_link in mondes_data:
            obj, _ = Monde.objects.get_or_create(
                title=title,
                defaults={
                    "description": f"<p>{desc}</p>",
                    "cta_text": cta_text,
                    "cta_link": cta_link,
                },
            )
            mondes.append(obj)

        # ── Pages ──
        # Récupérer la page racine et la HomePage
        root_page = Page.objects.filter(depth=1).first()
        if not root_page:
            self.stderr.write("Erreur : pas de page racine trouvée.")
            return

        try:
            home_page = HomePage.objects.first()
        except HomePage.DoesNotExist:
            home_page = None

        if not home_page:
            # Supprimer la page Wagtail par défaut si elle existe
            Page.objects.filter(title="Welcome to your new Wagtail site!").delete()
            home_page = HomePage(title="Wyrd - Festival du jeu de rôle", slug="home")
            root_page.add_child(instance=home_page)

        # ── HomePage : StreamField body ──
        self.stdout.write("  Mise à jour du contenu de la HomePage...")
        home_body = [
            {
                "type": "hero",
                "value": {
                    "title": "Incarne l'histoire",
                    "subtitle": "Pantin - 11 Oct. 2026",
                    "tagline": "Zéro prérequis. Observe, joue ou viens en famille",
                    "ticket_url": "https://example.com/billetterie",
                },
            },
            {
                "type": "presentation",
                "value": {
                    "title": "Plusieurs chemins s'offrent à toi",
                    "description": "Tous les choix sont possibles ! Tu peux regarder la scène, rejoindre une table, dévaliser les stands des créateurs.ices ou faire les trois dans la même journée, dans le même lieu. Pas de règles à apprendre avant d'arriver. Pas besoin de costumes. Pas de préparation. Seul.e ou en groupe. Passionné.e ou néophyte. WYRD est un festival de jeu de rôle ouvert à tous.tes. Écrivez votre propre histoire.",
                    "cards": [
                        {"title": "Je veux jouer"},
                        {"title": "Je viens voir"},
                        {"title": "Voir le show du soir"},
                        {"title": "On vient en famille"},
                        {"title": "Je viens flâner"},
                    ],
                },
            },
            {
                "type": "espaces",
                "value": {
                    "title": "5 lieux. Un monde.",
                    "subtitle": "Le Corbeau ouvre un monde et chaque lieu a sa façon de raconter.",
                    "mondes": [m.pk for m in mondes],
                },
            },
            {
                "type": "guests",
                "value": {
                    "title": "Cette histoire a déjà ses personnages.",
                    "guests": [g.pk for g in guests],
                },
            },
            {
                "type": "info",
                "value": {
                    "title": "Certaines histoires ne se racontent qu'une fois",
                    "access": "<p>La Cité Fertile<br/>14 Av. Edouard Vaillant, 93500<br/>Pantin</p>",
                    "schedule": "<p>Dimanche 11 Oct. 2026<br/>10h à 22h30</p>",
                },
            },
            {
                "type": "ticker",
                "value": {
                    "texts": [
                        "Jeu de rôle",
                        "Zéro préparation",
                        "Tout public",
                        "Actual play live",
                    ],
                },
            },
            {
                "type": "hero_fomo",
                "value": {
                    "title": "Ne rate pas le début de l'histoire",
                    "social_links": [socials[name].pk for name in socials],
                    "discord_url": "https://discord.gg/wyrdfestival",
                },
            },
        ]
        home_page.body = json.dumps(home_body)
        home_page.title = "Wyrd - Festival du jeu de rôle"
        home_page.save_revision().publish()

        # ── Page À Propos ──
        self.stdout.write("  Création de la page À Propos...")
        if not AProposPage.objects.exists():
            apropos = AProposPage(
                title="Mais au fond, c'est quoi Wyrd ?",
                slug="a-propos",
                subtitle="WYRD, c'est le premier festival exclusivement dédié au jeu de rôle en région parisienne.",
                content=(
                    "<h3>Quand est-ce que c'est ?</h3>"
                    "<p>Le dimanche 11 octobre à la Cité Fertile, de 10h à 22h30. "
                    "Une journée pour découvrir seul ou en famille le jeu de rôle en totale immersion ! "
                    "Au programme : tables rondes, sessions de jeu, exposants et actual plays. "
                    "Le soir, assistez en direct à une session d'actual play exceptionnelle organisée en partenariat avec…</p>"
                    "<h3>Qu'est-ce que le jeu de rôle ?</h3>"
                    "<p>C'est du théâtre de l'imaginaire, tout simplement. Un peu comme quand vous étiez enfant "
                    "et que vous passiez des heures à imaginer les aventures extraordinaires de tous les objets "
                    "ou jouets qui vous passaient sous la main. Une vieille passoire devenait une soucoupe volante "
                    "prête à attaquer une planète d'hommes brocolis. Les cailloux pouvaient se lier d'amitié avec "
                    "les pâquerettes et les chiens du voisin devenaient de terribles dragons, protecteurs de sorcières "
                    "ou gardiens d'un trésor ancien. Tout ça c'est du jeu de rôle. À la croisée des mondes - entre "
                    "l'aventure sociale, la création de mondes et le théâtre d'improvisation - le jeu de rôle est une "
                    "activité adaptable à tous.</p>"
                    "<h3>Quelles activités ?</h3>"
                    "<p>Une scène principale proposera tout au long de la journée des actual plays et des tables rondes "
                    "autour du jeu de rôle. Le soir, la scène laissera sa place aux reines de D&amp;Drags pour un actual "
                    "play en places limitées.</p>"
                    "<p>Une quarantaine de tables ouvertes pour venir découvrir le jeu de rôle.</p>"
                    "<p>Un espace famille avec des activités proposées toute la journée.</p>"
                    "<p>Une dizaine de stands d'exposants dont des éditeurs, auteurs, artistes et créateurs du monde "
                    "du jeu de rôle seront présents pour vous faire découvrir leurs univers.</p>"
                    "<h3>Quelles sont nos valeurs ?</h3>"
                    "<p>Un festival développé par des passionnés pour tous les curieux. Experts ou néophytes. "
                    "Petits et grands ! Tous les actual plays seront traduits en direct en langue des signes.</p>"
                ),
            )
            home_page.add_child(instance=apropos)
            apropos.save_revision().publish()

        # ── Page FAQ ──
        self.stdout.write("  Création de la page FAQ...")
        if not FAQPage.objects.exists():
            faq_categories = [
                {
                    "type": "category",
                    "value": {
                        "title": "Tables JdR",
                        "questions": [
                            {
                                "question": "Je n'ai jamais joué à un jeu de rôle, puis-je m'inscrire à une table ?",
                                "answer": "<p>Bien sûr ! Cet évènement est fait pour toi ! Les différentes tables proposées sont adaptées à tous les niveaux.</p>",
                            },
                            {
                                "question": "Comment s'inscrire à une table ?",
                                "answer": "<p>Pour s'inscrire à une table, il faut s'être inscrit au festival avant tout, sur le lien Helloasso. Pour les tables, les détails seront communiqués prochainement.</p>",
                            },
                            {
                                "question": "Comment s'inscrire à l'actual play ?",
                                "answer": "<p>Vous pouvez prendre votre place à l'actual play via la billetterie.</p>",
                            },
                            {
                                "question": "Je me suis inscrit à une table mais je ne peux plus venir.",
                                "answer": "<p>Possibilité d'annulation et de remboursement à voir.</p>",
                            },
                            {
                                "question": "Faut-il s'inscrire aux conférences ?",
                                "answer": "<p>Non, vous n'aurez pas besoin de vous inscrire, les conférences seront en libre accès.</p>",
                            },
                            {
                                "question": "Le contenu des scénarios est-il tout public ?",
                                "answer": "<p>Certaines tables peuvent aborder des thèmes plus matures. Un système de trigger warning sera mis en place pour vous aider à choisir.</p>",
                            },
                            {
                                "question": "Dois-je ramener du matériel ?",
                                "answer": "<p>Aucun matériel n'est requis ! Vous serez amené à écrire, donc vous pouvez prendre un stylo avec vous, même si nous en aurons sur place. Également si vous souhaitez garder une trace de vos parties, amenez un carnet !</p>",
                            },
                        ],
                    },
                },
                {
                    "type": "category",
                    "value": {
                        "title": "Infos pratiques",
                        "questions": [
                            {
                                "question": "Puis-je venir avec des enfants ?",
                                "answer": "<p>Oui ! L'évènement est justement prévu pour les familles. Des tables spéciales enfants seront proposées. Dans la billetterie vous trouverez également un tarif famille.</p>",
                            },
                            {
                                "question": "Je ne suis pas à l'aise avec le français, est-ce un frein ?",
                                "answer": "<p>Les parties seront proposées en français. Il s'agira toutefois d'un langage courant, accessible.</p>",
                            },
                            {
                                "question": "Y aura-t-il de la restauration sur place ?",
                                "answer": "<p>La restauration sera proposée directement par la Cité Fertile. Vous pouvez vous renseigner directement sur leur site internet.</p>",
                            },
                            {
                                "question": "Pourra-t-on s'inscrire sur place le jour J ?",
                                "answer": "<p>Oui vous pourrez prendre vos billets sur place, au même tarif.</p>",
                            },
                            {
                                "question": "J'aimerais changer mon billet, comment faire ?",
                                "answer": "<p>Vous pouvez annuler votre première commande et en passer une nouvelle.</p>",
                            },
                            {
                                "question": "Accès PMR",
                                "answer": "<p>Informations à venir. La Cité Fertile est accessible aux personnes à mobilité réduite.</p>",
                            },
                        ],
                    },
                },
            ]
            faq = FAQPage(
                title="J'ai plein de questions",
                slug="faq",
                subtitle="La page la plus utile du site (on dit ça, mais on le pense vraiment). Néophyte ou vieux de la vieille, les réponses sont ici. Et si on a raté la tienne, dis-le nous.",
                categories=json.dumps(faq_categories),
            )
            home_page.add_child(instance=faq)
            faq.save_revision().publish()

        # ── Page Programmation ──
        self.stdout.write("  Création de la page Programmation...")
        if not ProgrammationPage.objects.exists():
            prog_tabs = [
                {
                    "type": "tab",
                    "value": {
                        "title": "Scène",
                        "animations": [
                            {
                                "title": 'Table ronde "Pourquoi jouer au JdR ?"',
                                "date": "2026-10-11",
                                "start_time": "09:00",
                                "description": "<p>Une discussion ouverte entre joueurs, MJ et créateurs pour explorer les bienfaits du jeu de rôle.</p>",
                                "guests": [guests[0].pk, guests[1].pk],
                            },
                            {
                                "title": "Actual Play - Session découverte",
                                "date": "2026-10-11",
                                "start_time": "11:00",
                                "description": "<p>Assistez en direct à une partie de JdR jouée par des joueurs expérimentés. Interaction avec le public !</p>",
                                "guests": [guests[2].pk],
                            },
                            {
                                "title": "Grand Show du soir",
                                "date": "2026-10-11",
                                "start_time": "19:00",
                                "description": "<p>La soirée événement : un actual play d'exception en partenariat avec les D&amp;Drags. Places limitées.</p>",
                                "guests": [guests[0].pk, guests[3].pk, guests[4].pk],
                            },
                        ],
                    },
                },
                {
                    "type": "tab",
                    "value": {
                        "title": "Tables",
                        "animations": [
                            {
                                "title": "Tables courtes - Session 1",
                                "date": "2026-10-11",
                                "start_time": "10:00",
                                "description": "<p>Sessions de 45 minutes pour les débutants. Zéro préparation, on vous explique tout !</p>",
                                "guests": [],
                            },
                            {
                                "title": "Tables courtes - Session 2",
                                "date": "2026-10-11",
                                "start_time": "11:00",
                                "description": "<p>Sessions de 45 minutes pour les débutants. Zéro préparation, on vous explique tout !</p>",
                                "guests": [],
                            },
                            {
                                "title": "Tables longues - Après-midi",
                                "date": "2026-10-11",
                                "start_time": "14:00",
                                "description": "<p>Sessions de 2h à 3h pour les joueurs qui veulent aller plus loin. Inscription préalable requise.</p>",
                                "guests": [],
                            },
                        ],
                    },
                },
                {
                    "type": "tab",
                    "value": {
                        "title": "Familles",
                        "animations": [
                            {
                                "title": "Atelier JdR enfants (6-10 ans)",
                                "date": "2026-10-11",
                                "start_time": "10:00",
                                "description": "<p>Des parties adaptées aux plus jeunes avec des systèmes simples et des univers colorés.</p>",
                                "guests": [],
                            },
                            {
                                "title": "Partie famille",
                                "date": "2026-10-11",
                                "start_time": "14:00",
                                "description": "<p>Parents et enfants autour de la même table pour une aventure commune !</p>",
                                "guests": [],
                            },
                        ],
                    },
                },
                {
                    "type": "tab",
                    "value": {
                        "title": "Hub",
                        "animations": [
                            {
                                "title": "Micro-jeux en continu",
                                "date": "2026-10-11",
                                "start_time": "10:00",
                                "description": "<p>Le cœur social du festival. Venez découvrir des micro-jeux de rôle, faites une pause, rencontrez d'autres passionnés.</p>",
                                "guests": [],
                            },
                        ],
                    },
                },
                {
                    "type": "tab",
                    "value": {
                        "title": "Stands",
                        "animations": [
                            {
                                "title": "Exposants & créateurs",
                                "date": "2026-10-11",
                                "start_time": "10:00",
                                "description": "<p>Découvre les jeux, rencontre les éditeurs, auteurs, artistes et créateurs du monde du jeu de rôle.</p>",
                                "guests": [],
                            },
                        ],
                    },
                },
            ]
            prog = ProgrammationPage(
                title="Le programme (et on est fier de lui)",
                slug="programmation",
                subtitle="Tables ouvertes, scène allumée, espaces à explorer et quelques surprises qu'on garde pour nous. Tout ça le même jour, au même endroit. Il n'y a plus qu'à choisir par où commencer.",
                tabs=json.dumps(prog_tabs),
            )
            home_page.add_child(instance=prog)
            prog.save_revision().publish()

        # ── Settings : Header ──
        self.stdout.write("  Configuration du Header...")
        site = Site.objects.filter(is_default_site=True).first()
        if site:
            header, _ = HeaderSettings.objects.get_or_create(site=site)
            if (
                not header.nav_bar_left_links.exists()
                and not header.nav_bar_right_links.exists()
                and not header.nav_menu_top_links.exists()
                and not header.nav_menu_bottom_links.exists()
            ):
                pages_for_nav = {
                    "Programmation": ProgrammationPage.objects.first(),
                    "FAQ": FAQPage.objects.first(),
                    "À Propos": AProposPage.objects.first(),
                }
                nav_bar_left_links = [
                    ("Programmation", pages_for_nav.get("Programmation"), ""),
                    ("Réserver une table", None, "https://example.com/reservation"),
                ]
                nav_bar_right_links = [
                    ("Billetterie", None, "https://example.com/billetterie"),
                ]
                nav_menu_top_links = [
                    ("C'est quoi Wyrd ?", pages_for_nav.get("À Propos"), ""),
                    ("Programmation", pages_for_nav.get("Programmation"), ""),
                    ("Réserver une table", None, "https://example.com/reservation"),
                ]
                nav_menu_bottom_links = [
                    ("FAQ", pages_for_nav.get("FAQ"), ""),
                ]
                for i, (label, page, url) in enumerate(nav_bar_left_links):
                    HeaderNavBarLeftLink.objects.create(
                        header=header,
                        label=label,
                        page=page,
                        external_url=url,
                        sort_order=i,
                    )
                for i, (label, page, url) in enumerate(nav_bar_right_links):
                    HeaderNavBarRightLink.objects.create(
                        header=header,
                        label=label,
                        page=page,
                        external_url=url,
                        sort_order=i,
                    )
                for i, (label, page, url) in enumerate(nav_menu_top_links):
                    HeaderNavMenuTopLink.objects.create(
                        header=header,
                        label=label,
                        page=page,
                        external_url=url,
                        sort_order=i,
                    )
                for i, (label, page, url) in enumerate(nav_menu_bottom_links):
                    HeaderNavMenuBottomLink.objects.create(
                        header=header,
                        label=label,
                        page=page,
                        external_url=url,
                        sort_order=i,
                    )

            # ── Settings : Footer ──
            self.stdout.write("  Configuration du Footer...")
            footer, _ = FooterSettings.objects.get_or_create(site=site)
            if not footer.footer_social_links.exists():
                for i, social in enumerate(socials.values()):
                    FooterSocialLink.objects.create(
                        footer=footer,
                        social_media=social,
                        sort_order=i,
                    )

            if not footer.footer_page_links.exists():
                footer_links = [
                    ("FAQ", FAQPage.objects.first()),
                    ("À Propos", AProposPage.objects.first()),
                ]
                for i, (label, page) in enumerate(footer_links):
                    FooterPageLink.objects.create(
                        footer=footer,
                        label=label,
                        page=page,
                        sort_order=i,
                    )

        self.stdout.write(self.style.SUCCESS("Seed terminé avec succès !"))

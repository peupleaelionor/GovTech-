from flask import Flask, render_template, request, jsonify
import os
import json
import datetime

app = Flask(__name__)

# Simple in-memory store for demo purposes
conversation_history = []

SYSTEM_CONTEXT = (
    "Vous êtes un assistant IA gouvernemental français. "
    "Vous aidez les citoyens avec des informations officielles sur les services publics, "
    "les démarches administratives, les aides sociales, la fiscalité et toute autre question "
    "relative aux services de l'État. Répondez toujours de manière claire, précise et professionnelle."
)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Message manquant"}), 400

    user_message = data["message"].strip()
    if not user_message:
        return jsonify({"error": "Message vide"}), 400

    # Build a simple rule-based / keyword response for demo (no external API needed)
    response_text = _generate_response(user_message)

    entry = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "user": user_message,
        "assistant": response_text,
    }
    conversation_history.append(entry)

    return jsonify({"response": response_text, "timestamp": entry["timestamp"]})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "GovAI", "version": "1.0.0"})


def _generate_response(message: str) -> str:
    """Generate a contextual response based on keywords in the message."""
    msg = message.lower()

    if any(k in msg for k in ["bonjour", "salut", "hello", "bonsoir"]):
        return (
            "Bonjour ! Je suis l'Assistant IA Gouvernemental. "
            "Je suis là pour vous aider avec vos démarches administratives, "
            "les aides sociales, la fiscalité et bien plus encore. "
            "Comment puis-je vous aider aujourd'hui ?"
        )

    if any(k in msg for k in ["impôt", "impots", "taxe", "fiscal", "déclaration"]):
        return (
            "Pour vos questions fiscales, voici les ressources principales :\n"
            "• **impots.gouv.fr** – Déclaration de revenus en ligne\n"
            "• **Numéro de téléphone** : 0 809 401 401 (service gratuit)\n"
            "• **Délai de déclaration** : généralement de avril à juin selon votre département.\n"
            "Avez-vous une question spécifique sur votre situation fiscale ?"
        )

    if any(k in msg for k in ["caf", "allocation", "aide sociale", "rsa", "apl", "allocat"]):
        return (
            "Pour vos demandes d'aides sociales :\n"
            "• **caf.fr** – Caisse d'Allocations Familiales\n"
            "• **APL** (Aide Personnalisée au Logement) : simulateur disponible sur caf.fr\n"
            "• **RSA** (Revenu de Solidarité Active) : à demander auprès de votre CAF ou MSA\n"
            "• **Prime d'activité** : accessible si vous travaillez et avez de faibles revenus.\n"
            "Souhaitez-vous plus d'informations sur une aide particulière ?"
        )

    if any(k in msg for k in ["passeport", "carte d'identité", "cni", "pièce d'identité"]):
        return (
            "Pour renouveler ou obtenir une pièce d'identité :\n"
            "• **France Connect** ou **Ants.gouv.fr** pour la demande en ligne\n"
            "• Prenez rendez-vous en mairie (certaines mairies disposent de stations biométriques)\n"
            "• Documents nécessaires : état civil, justificatif de domicile, photos d'identité récentes.\n"
            "Délai moyen : 2 à 4 semaines selon la période."
        )

    if any(k in msg for k in ["emploi", "chômage", "pôle emploi", "france travail", "travail"]):
        return (
            "Pour les questions liées à l'emploi :\n"
            "• **francetravail.fr** (ex-Pôle Emploi) – Inscription, recherche d'emploi, allocations chômage\n"
            "• **Allocation chômage (ARE)** : ouverte si vous avez travaillé au moins 6 mois sur les 24 derniers mois\n"
            "• **Mon Compte Formation (CPF)** : cpf.fr pour financer vos formations\n"
            "• **Numéro** France Travail : 3949.\n"
            "Avez-vous une question précise sur vos droits ou démarches ?"
        )

    if any(k in msg for k in ["santé", "assurance maladie", "sécu", "sécurité sociale", "cpam", "ameli"]):
        return (
            "Pour vos droits à la santé :\n"
            "• **ameli.fr** – Gestion de votre compte Assurance Maladie (remboursements, arrêts de travail)\n"
            "• **Médecin traitant** : déclarez-le sur ameli.fr pour un meilleur remboursement\n"
            "• **Complémentaire santé solidaire (CSS)** : gratuite ou à faible coût selon vos revenus\n"
            "• **Numéro** : 36 46 (Assurance Maladie).\n"
            "Besoin d'informations supplémentaires ?"
        )

    if any(k in msg for k in ["retraite", "pension", "sénior"]):
        return (
            "Pour préparer ou gérer votre retraite :\n"
            "• **info-retraite.fr** – Estimation de votre retraite tous régimes confondus\n"
            "• **Demande de départ** : à effectuer au moins 4 à 6 mois à l'avance\n"
            "• **Age légal** de départ : 64 ans (réforme 2023), avec une retraite à taux plein à 67 ans\n"
            "• **Retraite anticipée** possible pour carrière longue ou handicap.\n"
            "Souhaitez-vous simuler votre retraite ?"
        )

    if any(k in msg for k in ["logement", "hlm", "habitation", "loyer", "propriétaire"]):
        return (
            "Pour les questions de logement :\n"
            "• **APL** (Aide Personnalisée au Logement) : demande sur caf.fr\n"
            "• **Logement social (HLM)** : demande via demande-logement-social.gouv.fr\n"
            "• **MaPrimeRénov'** : aide à la rénovation énergétique sur maprimerenov.gouv.fr\n"
            "• **Action Logement** : aides pour les salariés du secteur privé.\n"
            "Quelle est votre situation de logement ?"
        )

    if any(k in msg for k in ["merci", "au revoir", "bye", "bonne journée"]):
        return (
            "Merci de votre confiance ! N'hésitez pas à revenir si vous avez d'autres questions. "
            "Bonne journée et bonne continuation dans vos démarches administratives. 🇫🇷"
        )

    # Default response
    return (
        "Je suis l'Assistant IA Gouvernemental, ici pour vous aider avec :\n"
        "• 📋 Démarches administratives\n"
        "• 💶 Aides et allocations sociales\n"
        "• 🏥 Assurance maladie et santé\n"
        "• 💼 Emploi et formation\n"
        "• 🏠 Logement\n"
        "• 💰 Fiscalité et impôts\n"
        "• 🆔 Documents d'identité\n"
        "• 👴 Retraite\n\n"
        "Posez-moi votre question et je ferai de mon mieux pour vous orienter vers "
        "les bonnes ressources officielles."
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)

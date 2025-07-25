from flask import request, jsonify, Response, stream_with_context
from flask_cors import CORS
import json
from config import lore_agent, pddl_agent, reflective_agent 

def init_endpoints(app):
    CORS(app)

    # —————— LoreAgent endpoints ——————
    @app.route('/start_chat', methods=['POST'])
    def start_chat():
        resp = lore_agent.start_chat()
        return jsonify(
            status   = "success",
            response = resp["message"],
            action   = resp["action"]
        )


    @app.route('/send_message', methods=['POST'])
    def send_message():
        if not lore_agent.is_active():
            return jsonify(error="Chat non attiva. Chiama /start_chat prima"), 400

        data = request.get_json() or {}
        msg  = data.get('message','').strip()
        if not msg:
            return jsonify(error="Messaggio vuoto"), 400

        try:
            resp = lore_agent.send_message(msg)
            return jsonify(
                status   = "success",
                response = resp["message"],
                action   = resp["action"]
            )
        except Exception as e:
            return jsonify(error=str(e)), 500


    @app.route('/stop_chat', methods=['POST'])
    def stop_chat():
        if not lore_agent.is_active():
            return jsonify(error="Nessuna chat attiva."), 400

        lore_agent.stop_chat()
        return jsonify(status="success", message="Chat interrotta.")
    

    @app.route('/save_lore', methods=['POST'])
    def save_lore():
        if not lore_agent.is_active():
            return jsonify(error="Nessuna chat attiva, impossibile salvare il lore."), 400
        try:
            resp = lore_agent.save_lore()
            return jsonify(
                status   = "success",
                response = resp["message"],
                action   = resp["action"]
            ) 
        except Exception as e:
            return jsonify(error=str(e)), 500
        

    @app.route('/restart_chat', methods=['POST'])
    def restart_chat():
        try:
            resp = lore_agent.restart_chat()
            return jsonify(
                status="success",
                message="Chat riavviata con successo",
                response=resp["message"],
                action=resp["action"]
            )
        except Exception as e:
            return jsonify(
                status="error",
                message=f"Errore durante il riavvio: {str(e)}"
            ), 500

    # —————— PDDLAgent and ReflectiveAgents endpoints ——————
    @app.route('/process_stream', methods=['POST'])
    def process_stream():
        def event_stream():
            # 1) PDDL Agent
            for msg in pddl_agent.run():
                payload = {
                    "stage":   "pddl",
                    "event":   msg["event"]
                }
                if "message" in msg:
                    payload["message"] = msg["message"]
                else:
                    payload["payload"] = msg["payload"]
                yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

            # 2) Reflective Agent
            for msg in reflective_agent.run():
                payload = {
                    "stage":   "reflective",
                    "event":   msg["event"]
                }
                if "message" in msg:
                    payload["message"] = msg["message"]
                else:
                    payload["payload"] = msg["payload"]
                yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

        return Response(
            stream_with_context(event_stream()),
            mimetype='text/event-stream'
        )
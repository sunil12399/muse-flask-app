from flask import Flask, request, jsonify, render_template, redirect, url_for, abort, send_from_directory
import utils

app = Flask(__name__)
app.register_error_handler(404, page_not_found)
app.run(debug=False, port = 3000)

@app.route('/favicon.ico') 
def favicon(): 
    return send_from_directory('static', 'favicon.ico', mimetype='note.png')

@app.route('/')
def index():
    return render_template('home.html', name='Muse')

@app.route("/predict_music", methods = ['POST'])
def predict_music():
    global melody
    melody = request.form['song']
    melody = melody.strip()
    if melody == '':
        return render_template('editor.html', name='Muse')
    return redirect(url_for("player"))  

@app.route("/get-songs", methods = ['GET'])
def getSongs():
    try:
        data = utils.extract(melody)
        if len(data) == 0:
            abort(500)
        response = jsonify({
            'original': melody,
            'predictions' : data
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
    except:
        print('abort')
        abort(400)
    return response

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404page.html', error=error.code, describe=error.description), 404

@app.route("/editor")
def editor():
    return render_template('editor.html', name='Muse')

@app.route("/player")
def player():
    return render_template('music-player.html', name='Muse')

if __name__ == "__main__":
    print("Starting Python Server")
    utils.load_saved_artifacts()
    app.register_error_handler(404, page_not_found)
    app.run(debug=False, port = 3000)

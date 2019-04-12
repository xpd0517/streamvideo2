from flask import Flask,render_template, url_for,request
from flask_cors import CORS, cross_origin
from werkzeug import secure_filename
# from scripts.fb_storage import download_blob
# from scripts.grader import get_transcription, get_total_score
import os
import pickle
import os.path
from time import gmtime, strftime

app= Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

@app.route("/")
@app.route("/home")


def home():
	return render_template('index.html')
@app.route('/video',methods=['POST'])
def video():
	if request.method == 'POST':
		file = request.files['video']
		file.filename= strftime("%Y-%m-%d_%H-%M-%S", gmtime())+".mp4"
		print(file)
		
		
		file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
		return "success"


if __name__ == '__main__':
	app.run(debug=True,threaded=True)
	

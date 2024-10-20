from flask import Flask
import csv

app = Flask(__name__)
@app.route('/<reg_no>', methods=['GET'])  
def reg_no_handler(reg_no):
    found = False
    user_data = []
    with open('data.csv', mode='r') as file:
        reader = csv.reader(file)
        for row in reader:
            if (row[0] == reg_no):
                found  = True
                user_data = row
                break
        if found:
            return "Registration Number Found", 200
        else:
            return "Registration Number Not Found", 404

app.run(host="0.0.0.0", port=5000)


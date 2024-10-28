
from flask import Flask, request
from flask_cors import CORS
from connection import *
import json
import os
from analiza import *

app = Flask(__name__)
CORS(app)
validos = ['http://localhost']

def validaOrigem(origem):
    if origem in validos:
         return True
    else:
         return False

@app.route('/criarUsuario', methods=["POST"])
def criarUsuario():
    if(not validaOrigem(request.headers.get('Origin'))):
        return json.dumps(), 500, {'ContentType': 'application/json'}
    files = request.files.getlist('file[]')
    caminhosImagens = []
    for img in files:
        caminhosImagens.append(f'Facial_Recognize/tempImg/{img.filename}')
        img.save(f'Facial_Recognize/tempImg/{img.filename}')

    itensCalculados = retornoImagensDimensoes(caminhosImagens)

    if(not itensCalculados['result']):
        for img in caminhosImagens:
            os.remove(img)
        return json.dumps(itensCalculados), 200, {'ContentType': 'application/json'}

    user = request.args.get('user')
    senha = request.args.get('senha')

    criarUsuarioBanco(user, senha, itensCalculados['data'])

    for img in caminhosImagens:
        os.remove(img)
    return json.dumps({'result' : False, 'msg' : 'Usuário Criado, faça login novamente!', 'status' : 'success'}), 200, {'ContentType': 'application/json'}

@app.route('/validarUsuario', methods=["POST"])
def validarUsuario():
    if(not validaOrigem(request.headers.get('Origin'))):
        return json.dumps(), 500, {'ContentType': 'application/json'}
    img = request.files['file[]']

    img.save(f'Facial_Recognize/tempImg/{img.filename}')
    user = request.args.get('user')

    validacao = analisaImagemBanco(f'Facial_Recognize/tempImg/{img.filename}', user)
    return json.dumps(validacao), 200, {'ContentType': 'application/json'}
    
    
    
@app.route('/login', methods=["GET"]) 
def login():
    if(not validaOrigem(request.headers.get('Origin'))):
        return json.dumps(), 500, {'ContentType': 'application/json'}
    user = request.args.get('user')
    senha = request.args.get('senha')
    validacaoAcessoLogin = encontrarLogin(user)

    if(validacaoAcessoLogin != None):
        if(validacaoAcessoLogin['senha'] != senha):
            return json.dumps({'result' : False, 'msg' : 'Senha incorreta!', 'status' : 'error'}), 200, {'ContentType': 'application/json'}
        else:
            return json.dumps({'result' : True, 'tipo' : 1, 'status' : 'success'}), 200, {'ContentType': 'application/json'}
    else:
        return json.dumps({'result' : True, 'tipo' : 2, 'status' : 'success'}), 200, {'ContentType': 'application/json'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
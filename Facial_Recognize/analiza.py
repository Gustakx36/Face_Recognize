import cv2
import face_recognition as fr
from connection import *
import os 
import ast

def analisaImagemBanco(caminhoTemporario, user):
    encodeBancoLista = ast.literal_eval(buscaImagemDimensoes(user))

    imgTemp = fr.load_image_file(caminhoTemporario)
    imgTemp = cv2.cvtColor(imgTemp, cv2.COLOR_BGR2RGB)

    encodeimgTemp = fr.face_encodings(imgTemp)[0]

    os.remove(caminhoTemporario)

    if(fr.compare_faces(encodeBancoLista, encodeimgTemp, tolerance=0.3)[0]):
        return {'result' : True, 'msg' : 'Acesso concedido!', 'status' : 'success'}
    else:
        return {'result' : False, 'msg' : 'Face não válida para este perfil!', 'status' : 'error'}
    
def retornoImagensDimensoes(caminhoImagens):
    encodeBancoLista = []
    validaImagensNovas = []
    for item in caminhoImagens:
        img = fr.load_image_file(item) 
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodeImg = fr.face_encodings(img)[0]
        validaImagensNovas.append(encodeImg)
        encodeBancoLista.append(encodeImg.tolist())
     
    if(not analisaImagensNovas(validaImagensNovas)):
        return {'result' : False, 'msg' : 'Faces Divergentes!', 'status' : 'error'}

    return {'result' : True, 'data' : str(encodeBancoLista)}

def analisaImagensNovas(validaImagensNovas): 
    if(not fr.compare_faces(validaImagensNovas, validaImagensNovas[0], tolerance=0.3)[0]):
        return False
    if(not fr.compare_faces(validaImagensNovas, validaImagensNovas[1], tolerance=0.3)[0]):
        return False
    if(not fr.compare_faces(validaImagensNovas, validaImagensNovas[2], tolerance=0.3)[0]):
        return False
    return True
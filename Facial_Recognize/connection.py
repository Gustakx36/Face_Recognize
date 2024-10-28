import psycopg2
import psycopg2.extras
import os
import time

conn = psycopg2.connect(database=os.getenv('database'), 
                        user=os.getenv('user'), 
                        host=os.getenv('host'),
                        password=os.getenv('password'),
                        port=os.getenv('port'))

def encontrarLogin(user):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as mycursor:
        mycursor.execute("SELECT * FROM users WHERE login = %s", [user])
        myresult = mycursor.fetchone()
    return myresult

def encontrarLoginSenha(user, senha):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as mycursor:
        mycursor.execute("SELECT * FROM users WHERE login = %s AND senha = %s", [user, senha])
        myresult = mycursor.fetchone()
    return myresult

def criarUsuarioBanco(user, senha, caminho):
    with conn.cursor() as mycursor:
        mycursor.execute("INSERT INTO users(login, senha, foto_caminho) VALUES (%s, %s, %s)", [user, senha, caminho])
        conn.commit()
    return True

def buscaImagemDimensoes(user):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as mycursor:
        mycursor.execute("SELECT * FROM users WHERE login = %s", [user])
        myresult = mycursor.fetchone()
    return myresult['foto_caminho']

def criarTabelaUsers():
    try:
        with conn.cursor() as mycursor:
            mycursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                codigo SERIAL PRIMARY KEY,
                login TEXT NOT NULL,
                senha TEXT NOT NULL,
                foto_caminho TEXT
            );""")
            conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao criar tabela: {e}")
        return False
"""Авторизация и регистрация пользователей через телефон"""
import json
import os
import psycopg2
import random
import string

def generate_family_code():
    """Генерирует уникальный 6-значный код семьи"""
    return ''.join(random.choices(string.digits, k=6))

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        cur.execute(f'SET search_path TO {schema}')
        
        if action == 'login':
            phone = body.get('phone')
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Phone is required'})
                }
            
            cur.execute('SELECT id, phone, first_name, last_name, is_child, theme FROM users WHERE phone = %s', (phone,))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'})
                }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user[0],
                        'phone': user[1],
                        'firstName': user[2],
                        'lastName': user[3],
                        'isChild': user[4],
                        'theme': user[5]
                    }
                })
            }
        
        elif action == 'register':
            phone = body.get('phone')
            first_name = body.get('firstName', '')
            last_name = body.get('lastName', '')
            is_child = body.get('isChild', False)
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Phone is required'})
                }
            
            cur.execute('SELECT id FROM users WHERE phone = %s', (phone,))
            if cur.fetchone():
                cur.close()
                conn.close()
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User already exists'})
                }
            
            cur.execute(
                'INSERT INTO users (phone, first_name, last_name, is_child, theme) VALUES (%s, %s, %s, %s, %s) RETURNING id, phone, first_name, last_name, is_child, theme',
                (phone, first_name, last_name, is_child, 'default')
            )
            user = cur.fetchone()
            
            family_code = None
            if is_child:
                while True:
                    family_code = generate_family_code()
                    cur.execute('SELECT id FROM families WHERE family_code = %s', (family_code,))
                    if not cur.fetchone():
                        break
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user[0],
                        'phone': user[1],
                        'firstName': user[2],
                        'lastName': user[3],
                        'isChild': user[4],
                        'theme': user[5],
                        'familyCode': family_code
                    }
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

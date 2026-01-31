"""Управление семейными связями: генерация кода, активация, просмотр детей"""
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        cur.execute(f'SET search_path TO {schema}')
        
        if method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('userId')
            action = event.get('queryStringParameters', {}).get('action', 'get_code')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId is required'})
                }
            
            if action == 'get_code':
                cur.execute('SELECT is_child FROM users WHERE id = %s', (user_id,))
                user = cur.fetchone()
                
                if not user or not user[0]:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Only child accounts have family codes'})
                    }
                
                cur.execute('SELECT family_code FROM families WHERE child_id = %s LIMIT 1', (user_id,))
                existing = cur.fetchone()
                
                if existing:
                    family_code = existing[0]
                else:
                    while True:
                        family_code = generate_family_code()
                        cur.execute('SELECT id FROM families WHERE family_code = %s', (family_code,))
                        if not cur.fetchone():
                            break
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'familyCode': family_code})
                }
            
            elif action == 'get_children':
                cur.execute('''
                    SELECT u.id, u.first_name, u.last_name, u.phone, f.family_code
                    FROM families f
                    JOIN users u ON u.id = f.child_id
                    WHERE f.parent_id = %s
                ''', (user_id,))
                
                children = []
                for row in cur.fetchall():
                    children.append({
                        'id': row[0],
                        'firstName': row[1],
                        'lastName': row[2],
                        'phone': row[3],
                        'familyCode': row[4]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'children': children})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'activate_code':
                parent_id = body.get('parentId')
                family_code = body.get('familyCode')
                
                if not parent_id or not family_code:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'parentId and familyCode are required'})
                    }
                
                cur.execute('SELECT is_child FROM users WHERE id = %s', (parent_id,))
                parent = cur.fetchone()
                
                if not parent or parent[0]:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Parent must be an adult account'})
                    }
                
                cur.execute('''
                    SELECT u.id FROM users u
                    LEFT JOIN families f ON f.child_id = u.id
                    WHERE u.is_child = true AND (f.family_code IS NULL OR f.family_code = %s)
                    LIMIT 1
                ''', (family_code,))
                
                child = cur.fetchone()
                
                if not child:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid family code'})
                    }
                
                child_id = child[0]
                
                cur.execute('SELECT id FROM families WHERE parent_id = %s AND child_id = %s', (parent_id, child_id))
                if cur.fetchone():
                    return {
                        'statusCode': 409,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Family connection already exists'})
                    }
                
                cur.execute(
                    'INSERT INTO families (parent_id, child_id, family_code) VALUES (%s, %s, %s) ON CONFLICT (parent_id, child_id) DO NOTHING',
                    (parent_id, child_id, family_code)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Child account connected'})
                }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

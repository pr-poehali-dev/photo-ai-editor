"""Управление пользователями: обновление профиля, темы, удаление аккаунта"""
import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId is required'})
                }
            
            cur.execute('SELECT id, phone, first_name, last_name, is_child, theme FROM users WHERE id = %s', (user_id,))
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
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            user_id = body.get('userId')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId is required'})
                }
            
            if action == 'update_profile':
                first_name = body.get('firstName')
                last_name = body.get('lastName')
                is_child = body.get('isChild')
                
                cur.execute(
                    'UPDATE users SET first_name = %s, last_name = %s, is_child = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, phone, first_name, last_name, is_child, theme',
                    (first_name, last_name, is_child, user_id)
                )
                user = cur.fetchone()
                conn.commit()
                
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
            
            elif action == 'update_theme':
                theme = body.get('theme')
                if not theme:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'theme is required'})
                    }
                
                cur.execute('UPDATE users SET theme = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s', (theme, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'theme': theme})
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'})
                }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('userId')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId is required'})
                }
            
            cur.execute('UPDATE users SET phone = NULL, first_name = NULL, last_name = NULL WHERE id = %s', (user_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Account deleted'})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

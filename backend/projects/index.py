"""Управление проектами: создание, получение, обновление"""
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
            action = event.get('queryStringParameters', {}).get('action', 'list')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId is required'})
                }
            
            if action == 'list':
                cur.execute('''
                    SELECT id, title, image_url, thumbnail_url, created_at, updated_at
                    FROM projects
                    WHERE user_id = %s
                    ORDER BY updated_at DESC
                ''', (user_id,))
                
                projects = []
                for row in cur.fetchall():
                    projects.append({
                        'id': row[0],
                        'title': row[1],
                        'imageUrl': row[2],
                        'thumbnailUrl': row[3],
                        'createdAt': row[4].isoformat() if row[4] else None,
                        'updatedAt': row[5].isoformat() if row[5] else None
                    })
                
                cur.execute('SELECT is_child FROM users WHERE id = %s', (user_id,))
                user = cur.fetchone()
                is_child = user[0] if user else False
                
                if is_child:
                    cur.execute('''
                        SELECT p.id, p.title, p.image_url, p.thumbnail_url, p.created_at, p.updated_at
                        FROM projects p
                        JOIN families f ON f.child_id = p.user_id
                        WHERE f.parent_id = %s
                        ORDER BY p.updated_at DESC
                    ''', (user_id,))
                    
                    for row in cur.fetchall():
                        projects.append({
                            'id': row[0],
                            'title': row[1],
                            'imageUrl': row[2],
                            'thumbnailUrl': row[3],
                            'createdAt': row[4].isoformat() if row[4] else None,
                            'updatedAt': row[5].isoformat() if row[5] else None,
                            'isChildProject': True
                        })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'projects': projects})
                }
            
            elif action == 'get_children_projects':
                cur.execute('''
                    SELECT p.id, p.title, p.image_url, p.thumbnail_url, p.created_at, p.updated_at, u.first_name, u.last_name
                    FROM projects p
                    JOIN families f ON f.child_id = p.user_id
                    JOIN users u ON u.id = p.user_id
                    WHERE f.parent_id = %s
                    ORDER BY p.updated_at DESC
                ''', (user_id,))
                
                projects = []
                for row in cur.fetchall():
                    projects.append({
                        'id': row[0],
                        'title': row[1],
                        'imageUrl': row[2],
                        'thumbnailUrl': row[3],
                        'createdAt': row[4].isoformat() if row[4] else None,
                        'updatedAt': row[5].isoformat() if row[5] else None,
                        'childName': f"{row[6]} {row[7]}"
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'projects': projects})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create':
                user_id = body.get('userId')
                title = body.get('title', 'Новый проект')
                
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'userId is required'})
                    }
                
                cur.execute(
                    'INSERT INTO projects (user_id, title, data) VALUES (%s, %s, %s) RETURNING id, title, created_at',
                    (user_id, title, json.dumps({}))
                )
                project = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'project': {
                            'id': project[0],
                            'title': project[1],
                            'createdAt': project[2].isoformat() if project[2] else None
                        }
                    })
                }
            
            elif action == 'update':
                project_id = body.get('projectId')
                title = body.get('title')
                image_url = body.get('imageUrl')
                thumbnail_url = body.get('thumbnailUrl')
                data = body.get('data')
                
                if not project_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'projectId is required'})
                    }
                
                updates = []
                params = []
                
                if title:
                    updates.append('title = %s')
                    params.append(title)
                if image_url:
                    updates.append('image_url = %s')
                    params.append(image_url)
                if thumbnail_url:
                    updates.append('thumbnail_url = %s')
                    params.append(thumbnail_url)
                if data:
                    updates.append('data = %s')
                    params.append(json.dumps(data))
                
                updates.append('updated_at = CURRENT_TIMESTAMP')
                params.append(project_id)
                
                cur.execute(
                    f"UPDATE projects SET {', '.join(updates)} WHERE id = %s RETURNING id, title, image_url, thumbnail_url, updated_at",
                    params
                )
                project = cur.fetchone()
                conn.commit()
                
                if not project:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Project not found'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'project': {
                            'id': project[0],
                            'title': project[1],
                            'imageUrl': project[2],
                            'thumbnailUrl': project[3],
                            'updatedAt': project[4].isoformat() if project[4] else None
                        }
                    })
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

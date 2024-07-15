## Project Hub Api

**Installation Instructions**
- Clone the project from github
- Run npm install to install dependencies
- Create your database (mysql)
- Create a .env file and add all the env variables specified in .env.example
- Run migrations: npm run migrate
- Run seeds: npm run seed
- Run app: npm run dev

**Usage**
- Test login details 
  - email: "johnsmith@projecthub.com"
  - password: "123456"

### Endpoints

**POST /api/v1/auth/login**

- Login user

Parameters:

- Request body:
  - email: User email - required
  - password: User password - required

Response:

```
{
  "message": "Login Successful",
  "user" : {
      "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "first_name": "Jane",
      "last_name": "Doe"
    },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

**POST /api/v1/auth/signup**

- Create user account

Parameters:

- Request body:
  - first_name: User first name - required
  - last_name: User last name - required
  - email: User email - required
  - password: User password - required

Response:

```
{
  "message": "Sign up Successful",
  "user" : {
      "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "firstName": "Jane",
      "lastName": "Doe"
    },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

**GET /api/v1/users**

- Get user list to add team members when creating a new project or an existing one

Parameters:

- Authorization header: Bearer Token - required
- Query parameters:
  - query: User email or User first name or lastname - required
  - project_id: Project Id - optional

Response:

```
[
  {
    "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
    "firstName": "Jane",
    "lastName": "Doe"
  }
  ...
]
```

**GET /api/v1/projects**

- Get logged in user project list

Parameters:

- Authorization header: Bearer Token - required

Response:

```
[
  {
    "id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "title": "instock",
    "description": "",
    "manager_id" : "3312c711-65ff-427e-af6d-b767f429c3e5",
    "manager_first_name": "Jane",
    "manager_last_name": "Doe",
    "manager_email": "janedoe@gmail.com"
    "team" : [
      {
        "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
        "firstName": "Jane",
        "lastName": "Doe",
        "role": "manager"
      },
      {
       "id": "4312c821-65fg-437e-af1d-b466f120c2b8",
        "firstName": "Kate",
        "lastName": "Smith",
        "role: "member"
      }
    ]

  },
  ...

]
```

**POST /api/v1/projects**

- Create a project

Parameters:

- Authorization header: Bearer Token - required
- Request body:
  - title: project title - required
  - description: project description
  - team members: array of userids

Response:

```
{
  "message": "Project added successfully",
  "project": {
    "id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "title": "instock",
    "description": "",
    "manager_id" : "3312c711-65ff-427e-af6d-b767f429c3e5",
    "team" : [
      {
        "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "janedoe@gmail.com",
        "role": "manager"
      },
      {
        "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
        "firstName": "Kate",
        "lastName": "Smith",
        "email": "katesmith@gmail.com",
        "role": "member"
      }
    ]
  }
}

```

**GET /api/v1/projects/:id**

- Get single project data

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required

Response:

```
{
  "id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
  "title": "instock",
  "description": "",
  "manager_id" : "3312c711-65ff-427e-af6d-b767f429c3e5",
  "team" : [
    {
      "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "janedoe@gmail.com",
      "role": "manager"
    },
    {
      "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "firstName": "Kate",
      "lastName": "Smith",
      "email": "katesmith@gmail.com",
      "role": "member"
    }
    ...
  ]
}
```

**PUT /api/v1/projects/:id**

- Update a project

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required
- Request body:
  - title: project title - required
  - description: project description
  - team members: array of userids

Response:

```
{
  "message": "Project updated successfully",
  "project": {
    "id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "title": "instock",
    "description": "",
    "manager_id" : "3312c711-65ff-427e-af6d-b767f429c3e5",
    "team" : [
      {
        "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "janedoe@gmail.com",
        "role": "manager"
      },
      {
        "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
        "firstName": "Kate",
        "lastName": "Smith",
        "email": "katesmith@gmail.com",
        "role": "member"
      }
      ...
    ]
  }
}
```

**DELETE /api/v1/projects/:id**

- Delete project

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required

Response:

```
no content

```


**GET /api/v1/projects/:id/tasks**

- Get project tasks

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required

Response:

```
[
  {
    "id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "title" : "Create Header",
    "description": "",
    "user": {
      "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "firstName": "John",
      "lastName": "Doe"
    },
    "project_id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "status": "to do"
  },
  ...
]

```


**POST /api/v1/projects/:id/tasks**

- Add a task

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required
- Request body:
  - title: task title - required
  - description: task description
  - user_id: id of user assigned
  - status: task status

Response:

```
[
  {
    "id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "title" : "Create Header",
    "description": "",
    "user": {
      "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "firstName": "John",
      "lastName": "Doe"
    },
    "project_id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "status": "to do"
  },
  ...
]

```

**PUT /api/v1/projects/:projectId/tasks/:taskId**

- Update a task

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required
- task id route parameter - required
- Request body:
  - title: task title - required
  - description: task description
  - user_id: id of user assigned
  - status: task status

Response:

```
{
  message: "Task updated successfully",
  task: {
    "id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "title" : "Create Header",
    "description": "",
    "user": {
      "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "firstName": "John",
      "lastName": "Doe"
    },
    "project_id": "b4200cac-e736-4c16-8b77-a98ec3af6515",
    "status": "in progress"
  }
}

```

**DELETE /api/v1/projects/:projectId/tasks/:id**

- Delete a task

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required
- task id route parameter - required

Response:

```
no content

```

**GET /api/v1/projects/:id/team**

- Get project team

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required

Response:

```

{
  "project_id":"1312a711-65ff-427e-af6d-b767f429c3e8,
  "team": [
    {
     "id": "3312c711-65ff-427e-af6d-b767f429c3e5",
      "firstName": "John",
      "lastName": "Doe"
      "role" : "manager"
    }
    ...
  ]
  
},

```

**DELETE /api/v1/projects/:projectId/team/userId**

- Remove team member from project

Parameters:

- Authorization header: Bearer Token - required
- project id route parameter - required
- user id route parameter - required

Response:

```

{
  "message": "User removed successfully"
}

```

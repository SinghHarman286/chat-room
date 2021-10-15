# chat-room

## Overview
ChatRoom is an application where users can connect with one another through private chat rooms. Each user needs to have a profile in the app and they can create rooms, add other users to their rooms, remove users from room, or join other rooms.

## Technologies Used
- TypeScript
- React.JS (FrontEnd)
- Node.JS/Express.JS (BackEnd)
- MongoDB (Database)
- Socket.io
- React Router
- Ant Design (FrontEnd UI Library)

## App Flow

# Sign up and Log in

![CPT2110150201-1437x688](https://user-images.githubusercontent.com/67038446/137453819-93758303-28c6-47d9-9721-e8c30c82746b.gif)

- Authentication

![Screenshot 2021-10-15 at 2 08 00 AM](https://user-images.githubusercontent.com/67038446/137453998-0e076302-3ced-4449-874c-c2c33522fa41.png)


![Screenshot 2021-10-15 at 2 08 12 AM](https://user-images.githubusercontent.com/67038446/137454020-f2aef683-21a3-4b48-a2ae-0fd28c86172b.png)

- Authorization

![Screenshot 2021-10-15 at 2 15 12 AM](https://user-images.githubusercontent.com/67038446/137454984-1ce18537-dc6b-484f-ac58-fc3867279f43.png)


![Screenshot 2021-10-15 at 2 15 59 AM](https://user-images.githubusercontent.com/67038446/137455121-a60bd843-2d67-47ce-9eff-20548326aca5.png)

# Adding Web Sockets
![Screenshot 2021-10-15 at 2 19 10 AM](https://user-images.githubusercontent.com/67038446/137455738-faccf501-4adc-4a57-bbd0-6c8f8b82e5cc.png)


# Creating rooms
![CPT2110150219-1403x654](https://user-images.githubusercontent.com/67038446/137455906-60ab6cf8-7ad9-445c-b120-aca8e528b5ce.gif)


![Screenshot 2021-10-15 at 2 20 40 AM](https://user-images.githubusercontent.com/67038446/137455943-34644fe9-3b20-4f02-9e16-2a0530d4aa0e.png)

# Joining Rooms and Adding Users
![room](https://user-images.githubusercontent.com/67038446/137459213-1fb122d5-c379-47c1-a912-de96c8e67a8b.gif)

![Screenshot 2021-10-15 at 2 44 32 AM](https://user-images.githubusercontent.com/67038446/137459291-9771c207-a54c-4a48-87ec-ca24e98582e0.png)

# Removing Users
![room](https://user-images.githubusercontent.com/67038446/137459695-876d4fdf-12c3-4b35-8d07-95fa614004fc.gif)


![Screenshot 2021-10-15 at 2 35 56 AM](https://user-images.githubusercontent.com/67038446/137458142-e0d226d5-03c2-4cdf-b829-6ae4387c6d0a.png)


![Screenshot 2021-10-15 at 2 38 54 AM](https://user-images.githubusercontent.com/67038446/137458499-6bfe97e7-d114-4d0a-90f2-c5a9bc6634f9.png)

# Chatting between the users
![room](https://user-images.githubusercontent.com/67038446/137458370-7f079865-367e-4042-b88c-e9b8ace8d043.gif)


![Screenshot 2021-10-15 at 2 38 34 AM](https://user-images.githubusercontent.com/67038446/137458452-c8294f08-4792-4824-9c64-c55204b443de.png)



## Instructions to run the app:
- `npm install -g typescript`
- `npm install ts-node`
- `git clone https://github.com/SinghHarman286/chat-room.git`
- at the root of the project directory, run `cd api/ && npm install && npm start && cd ..`
- `cd. client/ && npm install && npm start`
- Visit localhost:3000


## Enhancements

- Deploy on Heroku
- Add refresh tokens
- Add Search through rooms and users

import logo from './logo.svg';
import './App.css';
import { getItemsWithIDsFromDB } from "./utils"
import {ResumeEditor} from "./Components/ResumeEditor/ResumeEditor"
import {useState } from "react"

const user = {username: "anon", id: 0, password: "encrypted", resume_ids: [0, 2], section_ids: [0, 1, 2, 3]}
function App() {
  let resumes = getItemsWithIDsFromDB(user, "resume", user.resume_ids); 
  return(
    <div>
      <ResumeEditor user={user} resume={resumes[0]} />
    </div>
  ); 
} 

export default App



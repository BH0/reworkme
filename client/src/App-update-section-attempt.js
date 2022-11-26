import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState, useRef, findDomNode } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { pdfExporter } from 'quill-to-pdf';
import { saveAs } from 'file-saver';
import Draggable from "react-draggable";


const fakeSectionDelta1 = {"ops":[{"insert":"ONE "},{"attributes":{"header":3},"insert":"\n"},{"attributes":{"color":"#666666"},"insert":"Freetime Project - Github Repo: "},{"attributes":{"color":"#1155cc","link":"https://github.com/BH0/Burgent"},"insert":"https://github.com/BH0/Burgent"},{"attributes":{"header":4},"insert":"\n"},{"insert":"Webapp designed to allow quick resume tailoring on the go "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"React frontend with a Rust (Rocket) REST API "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included "},{"attributes":{"color":"#ff0000"},"insert":"optimisations to achieve an X millisecond response time "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included using advance Rust techniques to achieve DRY code that interacts with poorly structured data"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"\n\n"}]}
const fakeSectionDelta2 = {"ops":[{"insert":"TWO "},{"attributes":{"header":3},"insert":"\n"},{"attributes":{"color":"#666666"},"insert":"Freetime Project - Github Repo: "},{"attributes":{"color":"#1155cc","link":"https://github.com/BH0/Burgent"},"insert":"https://github.com/BH0/Burgent"},{"attributes":{"header":4},"insert":"\n"},{"insert":"Webapp designed to allow quick resume tailoring on the go "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Face recognition with PHP backend"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included "},{"attributes":{"color":"#ff0000"},"insert":"optimisations to achieve an X millisecond response time "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included using advance Rust techniques to achieve DRY code that interacts with poorly structured data"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"\n\n"}]}
const fakeSectionDelta3 = {"ops":[{"insert":"THREE "},{"attributes":{"header":3},"insert":"\n"},{"attributes":{"color":"#666666"},"insert":"Freetime Project - Github Repo: "},{"attributes":{"color":"#1155cc","link":"https://github.com/BH0/Burgent"},"insert":"https://github.com/BH0/Burgent"},{"attributes":{"header":4},"insert":"\n"},{"insert":"Webapp designed to allow quick resume tailoring on the go "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"anime recogniser webapp"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included custom ML model which was validated with LIME"},{"attributes":{"color":"#ff0000"},"insert":"optimisations to achieve an X millisecond response time "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included using advance Rust techniques to achieve DRY code that interacts with poorly structured data"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"\n\n"}]}

// note: this could also potentially be used for mocking [unit tests] 
const fakeDatabase = { // note: should probably make all IDs start at 1 since thats likely what the MySQL database will do  
  // note: user's section_ids may need to be obtained from each resume instead of being hardcoded 
  users: [{username: "tim", id: 0, password: "encrypted", resume_ids: [0, 2], section_ids: [0, 1, 2]}, {username: "tim", id: 0, password: "encrypted", resume_ids: [2], section_ids: [0, 1, 2]}],
  resumes: [
    // this resume will display the frontend-projects section at the top & so on 
    {id: 0, title: "Frontend Developer", section_ids:[0, 1, 2]}, 
    // this resume will display the education section at the top & so on 
    {id: 1, title: "Work-in-progress-backend-dev", section_ids:[1, 0]}, // again, title [at least for now] is not coupled with the content 
    {id: 2, title: "UGGGGHHHHHHHHHHH", section_ids:[0, 1]} // again, title [at least for now] is not coupled with the content 
  ], 
  sections: [{
    // I may either rename "title" to "name", and have this be the name of the section, but not correspond to the contents 
    // otherwise I will try making the title more dynamic eg: 
    // title: this.section.delta.ops[0] // which makes the assumption that a user will also put the title at the start of each section 
    // or this.section.selta.ops.unshift(this.section.title) // meaning the user would have to NOT "hard-type" their section title directly into the [Quill] editor 
    // Since "user-research" would help make this decision - I am going to go with the simpler option of making the title disconnected from the actual delta 
    id: 0, title: "one", delta: fakeSectionDelta1 /* todo: make an example section using external Quill editor & copy delta into this field */
  }, {
    id: 1, title: "two", delta: fakeSectionDelta2 /* todo: make an example section using external Quill editor & copy delta into this field */
  }, {
    id: 2, title: "three", delta: fakeSectionDelta3 /* todo: make an example section using external Quill editor & copy delta into this field */
  }]
}

function getItemsWithIDsFromDB(container, desiredAsString, desired_ids) {
  // obtain IDs of the desired item 
  let desiredPlularized = desiredAsString+"s";
  const source = container // I guess container can be thought of as the starting node 
  let concatted = desiredAsString.concat("_ids")
  let ids = source[concatted]
  // determine where items lie within data 
  const desired = fakeDatabase[desiredPlularized]
  // obtain the actual desired items 
  let itemsToReturn = []
  desired.map(desiredItem => {
      if (ids.includes(desiredItem.id)) {
        itemsToReturn.push(desiredItem)
      }
    })
  return itemsToReturn
}

function Editor(props) { // currently not used 
    const [value, setValue] = useState(props.section.delta);
    const quillInstance = useRef(null); 
    let delta = props.section.delta 
    return(<div>
      <ReactQuill ref={quillInstance} theme="snow" value={value} onKeyDown={props.handleChange} />
    </div>)
} 

function ResumeEditor(props) {
    let {resume, user} = props
    let allUserSections = getItemsWithIDsFromDB(user, "section", user.section_ids); 
    let [allSectionsState, setAllSectionsState] = useState(allUserSections)
    let initialResumeSections = getItemsWithIDsFromDB(resume, "section", resume.section_ids); 
    let [resumeSectionsState, setResumeSectionsState] = useState(initialResumeSections) 
  // assume the user is already authd
  let quillInstance = useRef(null)
  let resumeSections_ids = resume.section_ids
  let styleState = {
    zIndex: 100, 
  }
    const swap = (list, a, b) => {
        let copiedList = [...list]
        let t = copiedList[a]
        copiedList[a] = copiedList[b]
        copiedList[b] = t
        return copiedList
    }
    // bear in mind this implementation only affects the HTML 
    // but the order of the actual data in the database will need to be changed too 
    // there for we'd like to iterate through the updated section order of the array & push the IDs to the resume's section_ids 
    // technically we could change the actual data itself but I believe that just makes the handling of the data more complex 
    // the moveSection methods are [almost] purely UI mutators - not data mutators 
    const moveSectionUp = e => { 
        let nss = [...resumeSectionsState] 
        let a = Number(e.target.dataset.sectionIndex)
        let b = Number(e.target.dataset.sectionIndex) - 1
        let swapped = swap(nss, a, b)
        setResumeSectionsState(swapped)
        e.target.dataset.sectionIndex = b 
    }
    const moveSectionDown = e => { 
      console.log(resumeSectionsState, "NOT swapped")
        let nss = [...resumeSectionsState] 
        let a = Number(e.target.dataset.sectionIndex) + 1
        let b = a - 1
        let swapped = swap(nss, a, b)
        setResumeSectionsState(swapped)
        e.target.dataset.sectionIndex = a 
        console.log(resumeSectionsState, "swapped")
    }
    const handleChange = (e) => {
      let copiedSections = [...resumeSectionsState]
      // bear in mind the additional parentNode because the recieved "e[vent]" argument is actually the Editor component's event argument 
      let stateSection = copiedSections[Number(e.target.parentNode.parentNode.parentNode.parentNode.dataset.sectionIndex)]
      setResumeSectionsState([...resumeSectionsState, stateSection])
      //quillInstance.current.editor.setContents(stateSection.delta)
    } 
  return(<div className="side-by-side">
      <div className="left">
        <h1>All Sections</h1>
        <div className="all-sections">
        </div> 
      </div>
      <div className="right">
        <h1>{resume.title}</h1>
        { resumeSectionsState.map((section,index) => {
            {return(
              <div data-section-id={section.id} data-section-index={index} >
                <button onClick={moveSectionUp} data-section-id={section.id} data-section-index={index}>Up</button>
                <button onClick={moveSectionDown} data-section-id={section.id} data-section-index={index}>Down</button>
                {/* using onkeyup because I'm hoping its better performance wise*/}
                <Editor section={section} handleChange={handleChange} /> 
              </div>
            )}})}
      </div>
  </div>)
}



function App() {
  let user = fakeDatabase.users[0] 
  let resumes = getItemsWithIDsFromDB(user, "resume", user.resume_ids); 
  return(
    <div>
      <ResumeEditor user={user} resume={resumes[0]} />
    </div>
  ); 
} 

function DivideIntoSmallerComponents() { // DivideIntoSmallerComponents
  const [signedIn, setSignedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const [delta, setDelta] = useState('');
  const [value, setValue] = useState('');
  const quillInstance = useRef(null)
  const [setPDF, pdf] = useState(null)
  const downloadResume = async e => {
    const quillDelta = quillInstance.current.editor.getContents();
    const pdfBlob = await pdfExporter.generatePdf(quillDelta);
    saveAs(pdfBlob, 'pdf-export.pdf'); // downloads from the browser
  }
  const signIn = (e) => {
    console.log("sign in") 
    setUsername(usernameRef.current.value)
    setPassword(passwordRef.current.value)
    //console.log(passwordRef.current.value)
    fetch("http://localhost:8000/sign-in/",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ username: usernameRef.current.value, password: passwordRef.current.value })
      })
      .then((response) => response.json().then(data => {
        setSignedIn(true)
        quillInstance.current.editor.setContents(data.delta)
    }))
      .catch(function (res) {
       // console.log(res)
      })
  }
  const createAccount = e => {
    fetch("http://localhost:8000/create-account/",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ username: usernameRef.current.value, password: passwordRef.current.value })
      })
      .then(function (res) { /* console.log(res) */ })
      .catch(function (res) { /* console.log(res) */ })

  }
  const saveResume = e => {
    // for setting delta should probably use setDelta or value [set via setValue] 
    const delta = quillInstance.current.editor.getContents(); 
    fetch("http://localhost:8000/save-resume/",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ user: username, delta: delta.ops })
      })
      .then(res => res.json(d => { /*console.log(res.json().then(d => console.log("SAVED")))*/ 
      }))
      .catch(function (res) {/* console.log(res) */})
  }
  return (
    <div>
      <div className="App">
        {!signedIn ? <input type="text" ref={usernameRef} /> : null}
        {!signedIn ? <input type="password" ref={passwordRef} /> : null}
        {!signedIn ? <button onClick={e => createAccount(e)}>Create account</button> : null}
        {!signedIn ? <button onClick={e => signIn(e)}>Sign in</button> : null}
        <button onClick={e => downloadResume(e)}>Download as pdf</button>
        {signedIn ? <button onClick={e => saveResume(e)}>Save</button> : null}
        <ReactQuill ref={quillInstance} theme="snow" value={value} onChange={setValue} />
      </div>
    </div>
  );
}

export default App;
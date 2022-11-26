import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { CreateNewSectionEditor } from "./CreateNewSectionEditor"
import { SectionEditor }  from "./SectionEditor"
import { pdfExporter } from 'quill-to-pdf';
import { saveAs } from 'file-saver';
import { getItemsWithIDsFromDB } from "../../utils"


export const ResumeEditor = (props) => {
  const ws = useRef(null)
   const quillInstance = useRef(null)
  const [setPDF, pdf] = useState(null)
  const [listRef] = useAutoAnimate(null)
  let {resume, user} = props
 let unused_in_current_resume_section_ids = user.section_ids.filter( id => !resume.section_ids.includes(id));
 let allUserSections = getItemsWithIDsFromDB(user, "section", unused_in_current_resume_section_ids); 
 let [allSectionsState, setAllSectionsState] = useState(allUserSections) // allows "used-sections" to appear on left list 
 let initialResumeSections = getItemsWithIDsFromDB(resume, "section", resume.section_ids); 
 let exportableData = []
 initialResumeSections.map(resume  => exportableData.push(resume.delta))
 let [exportableDataState, setExportableDataState] = useState(exportableData); 
    const [sectionsState, setSectionsState] =  useState(initialResumeSections)  
    const swap = (list, a, b) => {
        let listCopy = [...list]
        let t = listCopy[a]
        listCopy[a] = listCopy[b]
        listCopy[b] = t
        return listCopy
    }
    const moveSectionUp = e => { 
        let sectionsStateCopy = [...sectionsState] 
        let a = Number(e.target.dataset.sectionIndex)
        let b = Number(e.target.dataset.sectionIndex) - 1
        if (a > 0) {
          let swapped = swap(sectionsStateCopy, a, b)
          setSectionsState(swapped)
          e.target.dataset.sectionIndex = b 
        } 
    }
    const moveSectionDown = e => { 
        let sectionsStateCopy = [...sectionsState] 
        let a = Number(e.target.dataset.sectionIndex) + 1
        let b = a - 1
        if (a < sectionsStateCopy.length) {
          let swapped = swap(sectionsStateCopy, a, b)
          setSectionsState(swapped)
          e.target.dataset.sectionIndex = a 
        } 
    }
    const updateResumeSection = (section, newData) => { 
        let sectionIndex = sectionsState.map(section => section.id).indexOf(section.id)
        let sectionsCopy = [...sectionsState]
        sectionsCopy[sectionIndex].delta.ops = newData.ops; 
        setSectionsState(sectionsCopy)
    }
    const updateSection = (section, newData) => { 
        let sectionIndex = allSectionsState.map(section => section.id).indexOf(section.id)
        let allSectionsCopy = [...allSectionsState] 
        allSectionsCopy[sectionIndex].delta.ops = newData.ops; 
        setAllSectionsState(allSectionsCopy)
      }
    const createNewSection = (delta) => {
      let id = Math.max(...user.section_ids) + 1
      let section = {
        id: id, delta: delta.ops
      }
      let allSectionsStateCopy = [...allSectionsState]
      let sections = [ ...allSectionsStateCopy, section]
      setAllSectionsState(sections) 
    }
    const addSectionToResume = (section) => {
      let newSectionsState = [...sectionsState, section]
      setSectionsState(newSectionsState)
    }
    const exportResumeAsPDF = async (e) => {
     let ops = []
     exportableDataState.map(delta => delta.ops.map(op => ops.push(op)))
      quillInstance.current.editor.setContents({"ops": ops})
      const quillDelta = quillInstance.current.editor.getContents(); 
      const pdfBlob = await pdfExporter.generatePdf(JSON.parse(JSON.stringify(quillDelta))); // [minor bug] some content is missing 
      saveAs(pdfBlob, 'pdf-export.pdf'); // downloads from the browser 
    }
      useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080")
        socket.onopen = () => {
            socket.send(JSON.stringify({topic: "request-update-sections", content: sectionsState}))
        }
        socket.onclose = () => { }
        socket.onmessage = ({data}) => {
            const parsed = JSON.parse(data)
            if (parsed.topic == "response-update-sections") {
                setSectionsState(JSON.parse(data).content)
            }
        }
        ws.current = socket; 
        return () => {socket.close()}; 
    }, [sectionsState]);
    return(<div className="side-by-side">
      {/* will need to improve the HTML for these sections regarding the heading-1s*/}
        <div className="left"> 
          <h1>All Sections</h1>
          {allSectionsState.map((section, index) =>  {
              const resumeSectionsIDs = sectionsState.map(resumeSection => resumeSection.id) 
              /* 
                Originally I was thinking that the sections that exist in a resume, should not 
                be listed in the "all sections" list 
                But my implementation of that resulted in a bug
                And since I plan on implementing multiple resume functionality 
                This may make the user unable to add the same sections to different resumes 
                So I may introduce an improved represenation of used & unused resume specific sections 
              */
              //if (!resumeSectionsIDs.includes(section.id)) {
                return(<SectionEditor section={section} updateSection={updateSection} addSection={addSectionToResume}/>) 
              //}
          })}
          <CreateNewSectionEditor user={user} createNewSection={createNewSection} /> 
        </div>
        <div ref={listRef} className="right"> 
          <h1>Resume</h1>
          <button onClick={e => exportResumeAsPDF(e)}>EXPORT AS PDF</button>
          {sectionsState.map((section, index) => {
              return(<div key={section.id}>
                  <button onClick={moveSectionUp} data-section-identifier={section.id} data-section-index={index}>Up</button>
                  <button onClick={moveSectionDown} data-section-identifier={section.id} data-section-index={index}>Down</button>
                  <SectionEditor section={section} updateSection={updateResumeSection} /> 
              </div>)
          })}
        </div> 
        <ReactQuill className="hidden" ref={quillInstance} theme="snow"/>
    </div>)
}

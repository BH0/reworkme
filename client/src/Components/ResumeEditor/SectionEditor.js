import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill';

export const SectionEditor = (props) => { 
    const [value, setValue] = useState(props.section.delta);
    const quillInstance = useRef(null); 
    const delta = props.section.delta
    useEffect(() => {
      props.updateSection(props.section, quillInstance.current.editor.getContents()) 
    }, [value])
    const addSection = () => {
      let section = {
        id: props.section.id,
        delta: quillInstance.current.editor.getContents(), 
      } 
      props.addSection(section)
    }
    return(<div>
      {props.addSection != null ? <button onClick={addSection}>Add section to resume</button> : null}
      <ReactQuill ref={quillInstance} theme="snow" onChange={setValue} value={value} />
    </div>)
} 


import React, { useState, useRef} from 'react';
import ReactQuill  from 'react-quill';

export const CreateNewSectionEditor = (props) => {
    const [value, setValue] = useState('')
    const quillInstance = useRef(null)
    const createNewSection = (e) => {
      let delta = quillInstance.current.editor.getContents()
      quillInstance.current.editor.setContents("...")
      props.createNewSection(delta)
    }
    return(<div>
      <button onClick={createNewSection}>Create new section</button>
      <ReactQuill ref={quillInstance} theme="snow" value={value} onChange={setValue}  />
    </div>)
}

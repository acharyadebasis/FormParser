import React, {useState} from "react";
import axios from "axios";

const FloderReader = () =>{
    const [files, setFiles] = useState([])

  const handleFileChange = (e) =>{setFiles(e.target.files)}

  const handleUpload = async ()=>{
    const formData = new FormData()
    for (let file of files){
        formData.append('files', file);
    }
    try{
        await axios.post('/api/upload',formData,{
            headers:{
                'content-type':'multipart/form-data'
            }
        });
        alert("files uploaded successfully")
    }catch(error){
        console.error('Error uploading files', error);
        alert('Failed to upload the files')
    }
}

    
return (
    <div>
      <h1>Upload a folder</h1>
      <label>select the folder</label>
      <input directory="" webkitdirectory="" type="file"/>
      {/* <button type="sumibt" onClick={getDir} >select folder</button>  */}
      <button type="submit" >Upload</button>
    </div>
)
}

export default FloderReader;
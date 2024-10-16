import React,{useState} from "react";
import axios from 'axios';

function UploadFile(){

const [files, setFiles] = useState([]);

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

return(
    <>
    <label>select the folder</label>
    <input type="file" directory="" webkitdirectory="" onChange={handleFileChange}/>
  {/* <input type="file" multiple onChange={handleFileChange} /> */}
  <button type='submit' onClick={handleUpload}>File upload</button>
  </>
    )
}

export default UploadFile;
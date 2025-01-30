import React, {useRef} from "react";
import { Form } from "react-bootstrap";
import addFileIcon from "../assets/add-file.svg";


const FileButtonUploader = ({files, setFiles}) => {
    const fileRef = useRef();

    return (<Form.Group id="file" style={{ marginBottom: "1vh" }}>
  {files.map((el, index) => (
    <span key={index}>{el.name}</span> // Додав key для уникнення попередження
  ))}
  <div
    onClick={() => {
      fileRef.current && fileRef.current.click();
    }}
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#d9d9d9",
    }}
  >
    <div style={{ display: "flex", flexDirection: "row", padding: "1vh", fontSize: "2.5vh" }}>
      Завантажити файли
      <img src={addFileIcon} style = {{height: "3vh", width: "auto"}}/>
      <input
        type="file"
        style={{ display: "none" }}
        ref={fileRef}
        onChange={e => {
          setFiles(prevState => [
            ...prevState,
            ...Array.from(e.target.files).map(file => ({
              data: file,
              name: file.name,
              isFromDatabase: false,
            }))
          ]);
        }}
        multiple
      />
    </div>
  </div>
</Form.Group>)
}

export default FileButtonUploader
import logo from './logo.svg';
import './App.css';
// import { Form } from 'react-form'; 
import { useState } from 'react';

const findResult = totalItems => {
  // console.log(totalItems);
  const total_count = totalItems.length;
  let starGaze = 0;
  let forks = 0;
  let size = 0;
  const frequencies = {};
  totalItems.forEach(item => {
      // console.log(item);
      starGaze += item.stargazers_count;
      forks += item.forks_count;
      size += item.size;
      frequencies[item.language] = (frequencies[item.language] || 0) + 1;
  });
  const avgSize = size / total_count;

  const obj = {'total_count': total_count, 'total_stargaze': starGaze, 'total_fork': forks, 'avg_size': avgSize, 'frequencies': Object.entries(frequencies).sort((a, b) => b[1] - a[1])};
  

  return obj;
}

const analyze = async (name, include) => {
  const totalItems = [];
  let response = await fetch(`https://api.github.com/search/repositories?q=user:${name}+fork:${include}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${process.env.TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28'
        }
    });
  let body = await response.text();
  let jsonObj = JSON.parse(body);
  const numPages = Math.ceil(jsonObj.total_count / 30);
    jsonObj.items.forEach(item =>{
        totalItems.push(item);
    })

    for(let i = 1; i < numPages; i++){
        response = await fetch(`https://api.github.com/search/repositories?q=user:${name}+fork:${include}&page=${i + 1}`, {
            headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${process.env.TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        body = await response.text();
        jsonObj = JSON.parse(body);
        jsonObj.items.forEach(item =>{
            totalItems.push(item);
        })
    }
    // console.log(totalItems.length);
    const result = findResult(totalItems);
    // console.log(result.avg_size);
  return result;
  // console.log(include);
}
function App() {
  const [formData, setFormData] = useState({name: "",email: "",message: ""});
  const [jsonText, setJsonText] = useState("");
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(analyze(formData.name, formData.message).then(res => setJsonText(JSON.stringify(res))));
    // setJsonText(JSON.stringify(analyze(formData.name, formData.message)));
    
};

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}/>

        

        <label htmlFor="message">Include forked</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleChange}/>

        <button type="submit">Submit</button>
      </form>
      {jsonText}
    </div>
    
  );
}


export default App;

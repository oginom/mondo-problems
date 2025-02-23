import React, { FormEvent, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';

const API_URL = 'https://jtfu6mrypg.execute-api.ap-northeast-1.amazonaws.com/prod';

const SECRET = "●";

function App() {
  const [quiz, setQuiz] = useState({
    date: "2022-01-01",
    question: [],
    answers: [""],
    instruction: "",
  });

  const [indices, setIndices] = useState([0]);

  const [miss, setMiss] = useState(0);

  const [answer, setAnswer] = useState("");

  const [success, setSuccess] = useState(false);

  const [dates, setDates] = useState([""]);
  const [date, setDate] = useState("");

  //const search = useLocation().search;
  //const query2 = new URLSearchParams(search);
  const [searchParams, setSearchParams] = useSearchParams();
  const q_date = searchParams.get('date') ?? "";

  async function fetchData(d: string) {
    const response = await axios.get(`${API_URL}?date=${d}`);
    setQuiz(response.data);
    setIndices([]);
    setMiss(0);
    setSuccess(false);
    setAnswer("");
    setDate(d);

    setSearchParams({'date': d});

    return response;
  }

  useEffect(() => {

    // timezone のせいで 1日ずれているが、面倒なのでなぜか動くコードで動かす
    const today = new Date();
    var date0 = new Date(2022, 4, 18); // 2022-05-18
    var dates_r = [];
    for (var i=0;i<1500;++i) {
      date0.setDate(date0.getDate() + 1);
      dates_r.push(date0.toISOString().split("T")[0]);
      if (date0 > today) break;
    }

    var date_valid = "";
    if (dates_r.includes(q_date)) {
      date_valid = q_date;
    } else {
      date_valid = dates_r[dates_r.length-1];
    }
    setDates(dates_r);

    
    fetchData(date_valid);
  }, []);

  var letters = [];

  for(var i=0; i<quiz.question.length; ++i) {
    const opened = indices.includes(i);
    const letter = (opened || success) ? quiz.question[i] : SECRET;

    var className = "letter";

    if (!opened && success) {
      className += " letter-open";
    }

    const i_c = i;
    const clickFunc = function() {
      if (success) return;
      if (!indices.includes(i_c)) {
        setIndices([...indices, i_c]);
      }
    }
    letters.push(<div className={className} onClick={clickFunc}>{ letter }</div>);
  }

  var dateOptions = [];

  for (const i in dates) {
    dateOptions.push(<option value={dates[i]}>{dates[i]}</option>);
  }

  const submit = function() {
    if (quiz.answers.includes(answer)) {
      setSuccess(true);
    } else {
      setMiss(miss + 1);

    }
  }

  const prev = function() {
    var i = dates.indexOf(date) - 1;
    if (i<0) return;
    fetchData(dates[i]);
  }

  const next = function() {
    var i = dates.indexOf(date) + 1;
    if (i>dates.length-1) return;
    fetchData(dates[i]);
  }

  const dateChanged = function(event: any) {
    fetchData(event.target.value);
  }

  const getLink = function() {
    return `https://mondo.quizknock.com/?date=${date}&indices=${indices.join('-')}`;
  }

  const tweet = function() {
    var mat_s = "";
    for (var i=0; i<quiz.question.length; ++i) {
      if (i%6 === 0) mat_s += "\n";
      mat_s += indices.includes(i) ? "🗯️" : "🎈";
    }

    var text = `${date.replaceAll('-', '/')}

Score: ${ quiz.question.length - indices.length }/${ quiz.question.length } (${miss+1}回目)${mat_s}
`;
    var url = getLink();
    var n = dates.indexOf(date) - 14;
    var hashtags = "クイズMondo";
    if (n > 0) {
      hashtags += `,Mondo${n}`;
    }
    const intent_url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
    window.open(intent_url, '_blank');
  }

  return (
    <div className="App">
      <div className="App-content">
        <div>
          <select value={date} onChange={dateChanged}>
            {dateOptions}
          </select>
        </div>
        <div>
          <button onClick={prev}>&lt;</button>
          date: { date }
          <button onClick={next}>&gt;</button>
        </div>
        <div>
          count: { quiz.question.length - indices.length } / { quiz.question.length }
        </div>
        <div>
          miss: { miss }
        </div>
        <div className='letters'>
          { letters }
        </div>
        <div>
          ({ quiz.instruction })
        </div>
        <p>
          <input type="text" value={answer} onChange={(event) => setAnswer(event.target.value)}/>
          <button onClick={submit}>submit</button>
        </p>
        {success &&
          <div>
            correct!
          </div>
        }
        {success &&
          <div>
            <button onClick={tweet}>tweet</button>
          </div>
        }
        {success &&
          <div>
            <a target="_blanc" href={ getLink() } className="App-link">link</a>
          </div>
        }
      </div>
    </div>
  );
}

export default App;

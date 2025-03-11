import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import "../MyTopic/MyTopic.css";
import "../AboutUforum/About.css"
import './FAQ.css'

export default function FAQ(){
    const [uniqueExtension, setExtension] = useState()

    function setExt(index){
        if (uniqueExtension === 0 || uniqueExtension != index) setExtension(index)
        else setExtension(0)
    }
    return(
        <div className="topics-container">
            <div className="topics-content content-center">
                <div className="content-cards">
                    <h5>Часті питання</h5>
                    <div className="card">
                        <div className="card-head">
                            <h6>Чи можу я змінити ім’я користувача?</h6>
                            <IoIosArrowDown size={25} onClick={() => setExt(1)}
                            style ={uniqueExtension === 1 ? {transform: "rotate(180deg)"} : {transform: "rotate(0deg)"}}/>
                        </div>
                        {uniqueExtension === 1 ? (<p>Ні, обравши ім’я користувача на етапі реєстрації, Ви не маєте змогу змінити його пізніше.</p>) : ''}
                    </div>
                    <div className="card">
                        <div className="card-head">
                            <h6>Як зайти в акаунт, якщо забув пароль?</h6>
                            <IoIosArrowDown size={25} onClick={() => setExt(2)}
                            style ={uniqueExtension === 2 ? {transform: "rotate(180deg)"} : {transform: "rotate(0deg)"}}/>
                        </div>
                        {uniqueExtension === 2 ? (<p>Натисніть «Забули пароль?» на сторінці входу до
                             облікового запису та дотримуйтеся подальших інструкцій.</p>) : ''}
                    </div>
                    <div className="card">
                        <div className="card-head">
                            <h6>Як працює пошукова система?</h6>
                            <IoIosArrowDown size={25} onClick={() => setExt(3)}
                            style ={uniqueExtension === 3 ? {transform: "rotate(180deg)"} : {transform: "rotate(0deg)"}}/>
                        </div>
                        {uniqueExtension === 3 ? (<p>
                            Пошукова система дає змогу шукати користувачів UFORUM та теги,  які використовуються 
                            для створення тем або  комбінацію двох. 
                            <br/>1. Символ ‘@’ використовується для пошуку користувачів застосунку.
                            <br/>2. Символ ‘#’ використовується для пошуку тегів.
                            <br/>3. Комбінація цих символів запропонує теми, які створив вказаний у пошуку користувач із 
                            вказаним тегом. Вписаних користувачів та теги потрібно розділяти розділовим знаком: кома, слеш, крапка з комою.
                        </p>) : ''}
                    </div>
                </div>
                
            </div>
        </div>
    )
}
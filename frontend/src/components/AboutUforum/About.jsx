import React from "react";
import "../MyTopic/MyTopic.css";
import "./About.css"


export default function AboutPage(){
    return(
        <div className="topics-container">
            <div className="topics-content content-center">
                <div className="text-content">
                    <p><span className="uf"><span className="u">U</span>FORUM</span> - це онлайн форум для студентів, які прагнуть разом 
                    знаходити відповіді на питання та вирішувати проблеми колективно.</p>
                    <p>Наша емісія - об’єднати студентів на одній платформі, де вони зможуть легко спілкуватися та швидко отримувати відповіді на свої запитання.</p>
                    <p>Як працює UFORUM?</p>
                    <ul>
                        <li>Створення теми: користувачі можуть створювати нові теми для обговорення.</li>
                        <li>Коментування: інші користувачі залишають коментарі, висловлюючи свої думки.</li>
                        <li>Реакції: лайки та інші реакції піднімають популярні теми вище у списку.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
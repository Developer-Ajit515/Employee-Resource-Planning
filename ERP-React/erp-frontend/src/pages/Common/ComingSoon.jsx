import { useLocation } from "react-router-dom";
import {
    FaTools
} from "react-icons/fa";

import "./ComingSoon.css";


function ComingSoon() {

    const location =
        useLocation();


    const title =
        location.pathname
            .replace("/", "")
            .split("-")
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");


    return (

        <div className="coming-soon">

            <div className="coming-soon-icon">
                <FaTools />
            </div>

            <h1>
                {title || "Module"}
            </h1>

            <p>
                This ERP module is under development.
            </p>

            <span>
                The module will be connected to the
                ASP.NET Core API in the next phase.
            </span>

        </div>
    );
}


export default ComingSoon;
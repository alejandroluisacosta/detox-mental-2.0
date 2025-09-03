import { useEffect, useState } from "react";
import Course from "./Course";

export default function CourseWrapper() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="course-wrapper">
      {showIntro ? (
        <div className="intro-screen">
          <h1>Detox Mental...</h1>
        </div>
      ) : (
        <Course />
      )}
    </div>
  );
}
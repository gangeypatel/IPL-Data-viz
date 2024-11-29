import { motion } from "motion/react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const response = await fetch('ipl_dataset.csv');
      const text = await response.text();

      const parsedData = Papa.parse(text, { header: true }).data;

      navigate('/data', { state: { data: parsedData } });
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-100">
      <div className="p-auto rounded-xl items-center">
        <motion.button
          whileHover={{ x: -7, y: -7 }}
          className="btn button m-auto flex justify-center w-96"
          onClick={handleClick}
        >
          Click here to start 🚀
        </motion.button>
      </div>
    </div>
  );
};

export default Upload;
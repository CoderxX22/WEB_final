import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { db } from "../functionality/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const PieChart = () => {
    const [asthmaCount, setAsthmaCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleDataToPie = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching data...");

            const healthdataRef = collection(db, "/healthdata");

            // Corrected the where clause to use "Medical_Condition"
            const q = query(healthdataRef, where("Medical Condition", "==", "Asthma"));
            const querySnapshot = await getDocs(q);

            console.log("Asthma query snapshot:", querySnapshot);

            if (!querySnapshot.empty) {
                const asthmaCountValue = querySnapshot.docs.length;
                setAsthmaCount(asthmaCountValue);
                console.log("Asthma count:", asthmaCountValue);
            } else {
                setAsthmaCount(0);
                console.log("No asthma patients found.");
            }

            const totalSnapshot = await getDocs(healthdataRef);
            const totalCountValue = totalSnapshot.size;
            setTotalCount(totalCountValue);
            console.log("Total count:", totalCountValue);


        } catch (err) {
            console.error("Error fetching healthdata:", err);
            setError("Error fetching data. Please try again later.");
        } finally {
            setLoading(false);
            console.log("Data fetching complete");
        }
    };

    useEffect(() => {
        console.log("useEffect running");
        handleDataToPie();
    }, []);

    const data = {
        labels: ["Asthma", "Other Conditions"],
        datasets: [
            {
                data: [asthmaCount, totalCount - asthmaCount],
                backgroundColor: ["lightsteelblue", "lightblue"],
                hoverBackgroundColor: ["steelblue", "dodgerblue"],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw}`,
                },
            },
        },
    };

    if (loading) {
         return <div className="text-center">Loading chart...</div>;
    }

    if (error) {
         return <div className="text-center text-red-500">{error}</div>;
    }


    return (
        <div className="max-w-lg mx-auto p-4">
            <h2 className="text-xl text-black mb-4 text-center">2024 Medical Conditions Chart</h2>
           {asthmaCount >0 || totalCount>0 ? <Pie data={data} options={options} /> :  <div className="text-center">No data available to render the chart.</div>}
        </div>
    );
};

export default PieChart;
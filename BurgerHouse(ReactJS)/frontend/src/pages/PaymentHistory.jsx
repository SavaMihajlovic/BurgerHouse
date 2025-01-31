import React, { useEffect, useState } from "react";
import { UserFetch } from "@/components/UserFetch/UserFetch";
import axios from "axios";

export const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchUserPayments = async () => {
      try {
        const sessionKey = localStorage.getItem("sessionKey");
        if (!sessionKey) return;

        const user = await UserFetch(sessionKey);
        if (!user || !user.userEmail) return;

        const response = await axios.get(`http://localhost:5119/Paypal/GetAllUserPayments/user:${user.userEmail}`);
        if (response.status === 200 && response.data) {
            const formattedPayments = Object.entries(response.data)
            .map(([key, details]) => {
              const match = key.match(/:(\d+)$/); 
              return {
                id: match ? parseInt(match[1]) : null,
                amount: details.ammount,
                date: details.date
              };
            })
            .filter(payment => payment.id !== null) 
            .sort((a, b) => a.id - b.id);

          setPayments(formattedPayments);
        } else {
          console.error("Greška u pribavljanju istorije plaćanja");
        }
      } catch (error) {
        console.error("Greška pri preuzimanju podataka:", error);
      }
    };

    fetchUserPayments();
  }, []);

  return (
    <div className="table">
      {payments.length === 0 ? (
        <p>Nema dostupnih plaćanja</p>
      ) : (
        <table 
        style={{
            border: "1px solid white",
            borderCollapse: "collapse",
            paddingLeft: "20px",
            marginTop: "20px",
            width: "80%",
        }}
        >
        <thead>
            <tr>
            <th style={{ width: "20%", padding: "10px", border: "1px solid white" }}><strong>Redni broj</strong></th>
            <th style={{ width: "40%", padding: "10px", border: "1px solid white" }}><strong>Iznos</strong></th>
            <th style={{ width: "40%", padding: "10px", border: "1px solid white" }}><strong>Datum</strong></th>
            </tr>
        </thead>
        <tbody>
            {payments.map((payment) => (
            <tr key={payment.id}>
                <td style={{ width: "20%", padding: "10px", border: "1px solid white" }}>{payment.id}</td>
                <td style={{ width: "40%", padding: "10px", border: "1px solid white" }}>{payment.amount} EUR</td>
                <td style={{ width: "40%", padding: "10px", border: "1px solid white" }}>{payment.date}</td>
            </tr>
            ))}
        </tbody>
        </table>
      )}
    </div>
  );
};

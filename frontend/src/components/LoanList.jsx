import { useEffect, useState } from "react";
import { ethers } from "ethers";

function LoanList({ contract, account }) {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        async function loadLoans() {
            const ids = await contract.getUserLoans(account);
            const list = [];
            for (const id of ids) {
                const loan = await contract.loans(id);
                list.push({ ...loan, id });
            }
            setLoans(list);
        }
        if (contract) loadLoans();
    }, [contract, account]);

    return (
        <div>
            <h2>Your Loans</h2>
            <ul>
                {loans.map(ln => (
                    <li key={ln.id}>
                        Loan #{ln.id}: amount {ethers.formatEther(ln.amount)} ETH, {ln.funded ? "Funded" : "Pending"}{ln.repaid && ", Repaid"}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LoanList;

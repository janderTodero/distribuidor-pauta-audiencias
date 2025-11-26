import distributePauta from './src/utils/distribuirPauta.js';

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err.message);
    console.log(err.stack);
});

const pauta = [
    {
        "DATA": "2023-10-30", // Monday
        "HORA": "14:00",
        "TIPO": "AIJ",
        "ADVOGADO(A)": "",
        "PREPOSTO(A)": "",
        datetime: new Date("2023-10-30T14:00:00")
    }
];

const pessoas = [
    {
        nome: "Adv A", // 5 AIJ, 0 CONC
        tipo: "ADVOGADO",
        limiteDiario: 10,
        disponibilidade: {
            segunda: [{ inicio: "08:00", fim: "18:00", ativo: true }]
        },
        permissoes: { segunda: { AIJ: true, CONC: true } }
    },
    {
        nome: "Adv B", // 2 AIJ, 3 CONC
        tipo: "ADVOGADO",
        limiteDiario: 10,
        disponibilidade: {
            segunda: [{ inicio: "08:00", fim: "18:00", ativo: true }]
        },
        permissoes: { segunda: { AIJ: true, CONC: true } }
    },
    {
        nome: "Prep 1",
        tipo: "PREPOSTO",
        limiteDiario: 20, // Increased limit
        disponibilidade: {
            segunda: [{ inicio: "08:00", fim: "18:00", ativo: true }]
        }
    }
];

// Mock existing assignments to create the scenario
const pautaHistory = [];

// Adv A: 5 AIJ
for (let i = 0; i < 5; i++) {
    pautaHistory.push({
        "DATA": "2023-10-30",
        "HORA": `08:0${i}`,
        "TIPO": "AIJ",
        "ADVOGADO(A)": "Adv A",
        "PREPOSTO(A)": "Prep 1",
        datetime: new Date(`2023-10-30T08:0${i}:00`)
    });
}

// Adv B: 2 AIJ, 3 CONC
for (let i = 0; i < 2; i++) {
    pautaHistory.push({
        "DATA": "2023-10-30",
        "HORA": `09:0${i}`,
        "TIPO": "AIJ",
        "ADVOGADO(A)": "Adv B",
        "PREPOSTO(A)": "Prep 1",
        datetime: new Date(`2023-10-30T09:0${i}:00`)
    });
}
for (let i = 0; i < 3; i++) {
    pautaHistory.push({
        "DATA": "2023-10-30",
        "HORA": `09:1${i}`,
        "TIPO": "CONC",
        "ADVOGADO(A)": "Adv B",
        "PREPOSTO(A)": "Prep 1",
        datetime: new Date(`2023-10-30T09:1${i}:00`)
    });
}

const fullPauta = [...pautaHistory, ...pauta];

console.log("Running distribution...");
try {
    const result = distributePauta(fullPauta, pessoas);

    // The last item is our target
    const targetAssignment = result[result.length - 1];
    const assignedAdv = targetAssignment["ADVOGADO(A)"];

    console.log(`Assigned Lawyer: ${assignedAdv}`);

    if (assignedAdv === "Adv B") {
        console.log("SUCCESS: Adv B prioritized (Fewer AIJs).");
    } else {
        console.log(`FAILURE: Expected 'Adv B', but got '${assignedAdv}'`);
    }
} catch (error) {
    console.log("CAUGHT ERROR:", error.message);
    console.log(error.stack);
}

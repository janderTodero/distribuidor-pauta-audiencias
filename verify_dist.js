import distribuirPauta from './src/utils/distribuirPauta.js';

const mockPauta = [
    { datetime: new Date('2023-11-27T10:00:00'), "AC / AIJ / ACIJ": "AIJ" },
    { datetime: new Date('2023-11-27T14:00:00'), "AC / AIJ / ACIJ": "CONC" },
    { datetime: new Date('2023-11-27T16:00:00'), "AC / AIJ / ACIJ": "AIJ" }
];

const mockPessoas = [
    {
        nome: "Advogado A",
        tipo: "ADVOGADO",
        disponibilidade: { segunda: [{ inicio: "09:00", fim: "18:00", ativo: true }] },
        permissoes: { segunda: { AIJ: true, CONC: true } }
    },
    {
        nome: "Advogado B",
        tipo: "ADVOGADO",
        disponibilidade: { segunda: [{ inicio: "09:00", fim: "12:00", ativo: true }] },
        permissoes: { segunda: { AIJ: true, CONC: true } }
    }
];

try {
    console.log("Running distribution...");
    const result = distribuirPauta(mockPauta, mockPessoas);
    console.log("Distribution result:", JSON.stringify(result, null, 2));
    console.log("Success!");
} catch (error) {
    console.error("Error:", error);
    process.exit(1);
}

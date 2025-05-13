import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {

      const mockData = [
        { id: 1, name: 'John Doe', status: 'screening', score: 76 },
        { id: 2, name: 'Jane Smith', status: 'technical', score: 88 }
      ];
      setCandidates(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCandidateData = (file) => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const newCandidates = jsonData.map((item, index) => ({
            id: candidates.length + index + 1,
            name: item['Name'] || item['Candidate Name'] || `Candidate ${index}`,
            status: item['Status'] || 'screening',
            score: item['Score'] || 0
          }));

          setCandidates([...candidates, ...newCandidates]);
          resolve(newCandidates);
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <DataContext.Provider
      value={{
        candidates,
        isLoading,
        uploadCandidateData,
        refreshData: fetchInitialData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

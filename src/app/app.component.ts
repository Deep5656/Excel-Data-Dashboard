import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit{

  title = 'dashbordApp';
  ExcelData: any;
  tableConfig: any;
  uploadedFileName: any;
  isEditing: any = true;
  isEditingColumn: any;
  columnValues: any[] = [];
  originalColumnName:any;

  ngOnInit() {

  }

  readExcel(event: any) {
    let file = event.target.files[0];
    this.uploadedFileName = event.target.files[0].name;
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e) => {
      var arrayBuffer = fileReader.result;
      var workBook = XLSX.read(arrayBuffer, { type: 'array' });
      var workSheetName = workBook.SheetNames[0];
      var workSheet = workBook.Sheets[workSheetName];
      this.ExcelData = XLSX.utils.sheet_to_json(workSheet);
      console.log(this.ExcelData);

      // Create table config dynamically
      const columns = Object.keys(this.ExcelData[0]);
      this.tableConfig = {
        columns: columns.map(column => ({ title: column, field: column }))
      };
      console.log(this.tableConfig);

      // Initialize isEditing
      this.isEditing = false;
    }
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  updateData() {
    this.ExcelData.forEach((row: any) => {
      this.tableConfig.columns.forEach((column: any, index: number) => {
        if (!row[column.field]) {
          row[column.field] = '';
        }
      });
    });
  
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.ExcelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, this.uploadedFileName);
  }
  // updateData() {
  //   this.ExcelData.forEach((row: any) => {
  //     this.tableConfig.columns.forEach((column: any, index: number) => {
  //       row[column.field] = row[column.field] || '';
  //       if (column.title !== Object.keys(row)[index]) {
  //         row[column.title] = row[column.field];
  //         delete row[column.field];
  //       }
  //     });
  //   });

  //   const wb = XLSX.utils.book_new();
  //   const ws = XLSX.utils.json_to_sheet(this.ExcelData);
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   XLSX.writeFile(wb, this.uploadedFileName);
  // }


  addRow() {
    const newRow: Record<string, any> = {};
    this.tableConfig.columns.forEach((column: { field: string | number; }) => {
      newRow[column.field] = '';
    });
    this.ExcelData.push(newRow);
    console.log(this.ExcelData);
    
  }

  addColumn() {
    const newColumnTitle = `New Column${this.tableConfig.columns.length}`;
    const newColumnField = `New Column${this.tableConfig.columns.length}`;
    this.tableConfig.columns.push({ field: newColumnField, title: newColumnTitle });
    console.log(this.tableConfig.columns);
    this.columnValues.push([]);
  }

editColumnName(index: number) {
  if (this.tableConfig.columns[index].title === '') {
    this.tableConfig.columns[index].title = ' ';
  }
  this.isEditingColumn = index;
  this.tableConfig.columns[index].field = this.tableConfig.columns[index].title;
  this.originalColumnName = this.tableConfig.columns[index].title;
}

cancelEditColumnName() {
  this.tableConfig.columns[this.isEditingColumn].title = this.originalColumnName;
  this.isEditingColumn = null;
}

saveColumnName(index: number) {
  if (this.tableConfig.columns[index].title === '') {
    this.tableConfig.columns[index].title = 'Untitled_'+index.toString();
  }
  let newFieldName = this.tableConfig.columns[index].title;
  const oldFieldName = this.originalColumnName;
  // let counter = 1;
  // while (this.tableConfig.columns.some((column: any) => column.field === newFieldName)) {
  //   newFieldName = `${this.tableConfig.columns[index].title}_${counter}`;
  //   counter++;
  // }
  this.ExcelData.forEach((row: any) => {
    if (row[oldFieldName]) {
      row[newFieldName] = row[oldFieldName];
      delete row[oldFieldName];
    }
  });
  this.tableConfig.columns[index].field = newFieldName;
  this.isEditingColumn = null;
}


deleteColumn(index: number) {
  if(confirm("Are you sure you want to delete this column?")) {
    const columnField = this.tableConfig.columns[index].field;
    this.tableConfig.columns.splice(index, 1);
    this.ExcelData.forEach((row: any) => {
      delete row[columnField];
    });
  } 
}

deleteRow(index: number) {
  if (confirm("Are you sure you want to delete this row?")) {
    this.ExcelData.splice(index, 1);
  }
}
 
}

  

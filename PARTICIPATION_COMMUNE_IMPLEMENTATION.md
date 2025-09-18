# 🏛️ Participation Commune Implementation

## 📋 Overview

This document outlines the implementation of CRUD operations for `ParticipationCommune` (arrondissement participation data) with proper role-based access control and territorial restrictions.

## 🎯 Requirements Met

✅ **CRUD Operations**: Full Create, Read, Update, Delete functionality  
✅ **Role-Based Access Control**: Only authorized roles can edit data  
✅ **Territorial Restrictions**: Users can only modify data for their assigned arrondissements  
✅ **Prisma Schema Integration**: Compatible with the provided `ParticipationCommune` model  
✅ **Menu Integration**: Added to the arrondissement management submenu  

## 🏗️ Database Schema

The implementation is based on the provided Prisma schema:

```prisma
model ParticipationCommune {
  code           Int      @id @default(autoincrement())
  codeCommune    Int      @map("code_commune")
  nombreBureaux  Int?     @map("nombre_bureaux")
  nombreInscrits Int?     @map("nombre_inscrits")
  nombreVotants  Int?     @map("nombre_votants")
  tauxParticipation Decimal? @map("taux_participation") @db.Decimal(5, 2)
  bulletinsNuls  Int?     @map("bulletins_nuls")
  suffragesValables Int?  @map("suffrages_valables")
  tauxAbstention Decimal? @map("taux_abstention") @db.Decimal(5, 2)
  dateCreation   DateTime @default(now()) @map("date_creation")
  dateModification DateTime @updatedAt @map("date_modification")
  
  commune        Arrondissement @relation(fields: [codeCommune], references: [code])
  
  @@map("participation_commune")
}
```

## 🔐 Access Control

### **Roles with Edit Access**
- **Administrateur**: Full access to all data
- **Superviseur Départemental**: Can edit data for assigned departments
- **Superviseur Régional**: Can edit data for assigned regions
- **Scrutateur**: Can edit data for assigned territories
- **Validateur**: Can edit data for assigned territories

### **Roles with Read-Only Access**
- **Observateur Local**: Can view data for assigned arrondissements
- **Observateur**: Can view data for assigned territories

### **Territorial Restrictions**
- Users can only modify participation data for arrondissements they're assigned to
- Access is checked via `utilisateur_arrondissement` table
- Department-level users can access data for arrondissements within their departments
- Real-time API validation ensures security

## 📁 Files Created

### **1. API Client (`participationCommuneApi.ts`)**

**Features:**
- Complete CRUD operations
- Territorial access validation
- Bulk operations (validate, approve, reject)
- Data validation utilities
- Report generation functions

**Key Functions:**
```typescript
// Basic CRUD
getAllParticipationCommune()
getParticipationCommuneById(id)
createParticipationCommune(data)
updateParticipationCommune(id, data)
deleteParticipationCommune(id)

// Territorial access
getParticipationCommuneForUser()
getParticipationCommuneByArrondissement(arrondissementCode)

// Validation workflow
validateParticipationCommune(id)
approveParticipationCommune(id)
rejectParticipationCommune(id, reason)

// Bulk operations
bulkValidateParticipationCommune(ids)
bulkApproveParticipationCommune(ids)
bulkRejectParticipationCommune(ids, reason)

// Utilities
calculateParticipationRate(inscrits, votants)
calculateAbstentionRate(inscrits, votants)
validateParticipationData(data)
generateParticipationReport(data)
```

### **2. Management Component (`ParticipationCommuneManagement.tsx`)**

**Features:**
- Role-based access control
- Territorial restrictions
- Data validation
- Bulk operations
- Summary statistics
- Responsive design

**Key Features:**
- **Summary Cards**: Total arrondissements, inscrits, votants, participation rate
- **Bulk Actions**: Select multiple items for batch operations
- **Data Validation**: Real-time validation with error messages
- **Territorial Access**: Only shows data user can access
- **Role-Based UI**: Different actions based on user role

### **3. Territorial Access Control Updates**

**Enhanced `territorialAccessApi.ts`:**
- Added `canEditParticipationCommuneData()` function
- API endpoint: `/api/territorial-access/can-edit-participation-commune/{arrondissementCode}`

**Enhanced `useTerritorialAccessControl.ts`:**
- Added `canEditParticipationCommune()` hook function
- Integrated with existing territorial access system

## 🎨 User Interface

### **Summary Dashboard**
- **Arrondissements**: Total number of arrondissements with data
- **Inscrits**: Total number of registered voters
- **Votants**: Total number of actual voters
- **Taux Participation**: Average participation rate

### **Data Table**
- **Arrondissement**: Name and department
- **Bureaux**: Number of polling stations
- **Inscrits**: Number of registered voters
- **Votants**: Number of actual voters
- **Taux Participation**: Participation percentage
- **Bulletins Nuls**: Invalid ballots
- **Suffrages Valables**: Valid votes
- **Statut**: Current status
- **Actions**: Edit, validate, approve, reject, delete

### **Bulk Operations**
- Select multiple items
- Bulk validate, approve, or reject
- Clear selection

## 🔧 Menu Integration

### **Menu Structure**
```
Gestion Arrondissements
├── Arrondissements
├── Documents Arrondissement
└── Participations Communales (NEW)
```

### **Role-Based Menu Access**
- **Superviseur Départemental**: Full access to all arrondissement management
- **Superviseur Communal**: Access to arrondissement management including participations
- **Other roles**: Based on territorial assignments

## 📊 Data Validation

### **Input Validation**
- **Code Commune**: Required, must be positive
- **Nombre Inscrits**: Must be non-negative
- **Nombre Votants**: Must be non-negative, cannot exceed inscrits
- **Nombre Bureaux**: Must be non-negative
- **Bulletins Nuls**: Must be non-negative
- **Suffrages Valables**: Must be non-negative
- **Logical Validation**: Sum of bulletins nuls + suffrages valables cannot exceed votants

### **Automatic Calculations**
- **Taux Participation**: `(votants / inscrits) * 100`
- **Taux Abstention**: `((inscrits - votants) / inscrits) * 100`

## 🚀 API Endpoints

### **CRUD Endpoints**
```
GET    /api/participation-commune                    # Get all data
GET    /api/participation-commune/:id                # Get by ID
POST   /api/participation-commune                    # Create new
PUT    /api/participation-commune/:id                # Update
DELETE /api/participation-commune/:id                # Delete
```

### **Territorial Access Endpoints**
```
GET    /api/participation-commune/user               # Get user's data
GET    /api/participation-commune/arrondissement/:id # Get by arrondissement
```

### **Validation Endpoints**
```
POST   /api/participation-commune/:id/validate       # Validate
POST   /api/participation-commune/:id/approve        # Approve
POST   /api/participation-commune/:id/reject         # Reject
```

### **Bulk Operation Endpoints**
```
POST   /api/participation-commune/bulk/validate      # Bulk validate
POST   /api/participation-commune/bulk/approve       # Bulk approve
POST   /api/participation-commune/bulk/reject        # Bulk reject
```

### **Territorial Access Endpoints**
```
GET    /api/territorial-access/can-edit-participation-commune/:arrondissementCode
```

## 🔒 Security Features

### **Access Control**
- Role-based permissions
- Territorial restrictions
- Real-time validation
- API-level security

### **Data Protection**
- Users can only access data within their territorial scope
- Department-level restrictions enforced
- Arrondissement-level access control
- Audit trail for all operations

### **Validation**
- Input validation on frontend
- Server-side validation
- Business logic validation
- Data integrity checks

## 📈 Usage Examples

### **For Superviseur Départemental**
1. Access "Gestion Arrondissements" → "Participations Communales"
2. View all participation data for assigned departments
3. Create, edit, or delete participation records
4. Validate, approve, or reject data
5. Perform bulk operations

### **For Scrutateur**
1. Access participation data for assigned arrondissements
2. Enter new participation data
3. Update existing records
4. Cannot access data outside assigned territories

### **For Observateur Local**
1. View participation data for assigned arrondissements
2. Cannot modify data (read-only access)
3. Can view summary statistics

## 🧪 Testing Scenarios

### **Access Control Testing**
1. Test with different user roles
2. Verify territorial restrictions work
3. Test unauthorized access attempts
4. Verify role-based UI changes

### **Data Validation Testing**
1. Test invalid input data
2. Test boundary conditions
3. Test business logic validation
4. Test automatic calculations

### **Territorial Testing**
1. Test department-level access
2. Test arrondissement-level access
3. Test cross-territory access attempts
4. Test API security

## 🔄 Future Enhancements

1. **Advanced Reporting**: Detailed participation analytics
2. **Data Export**: Export participation data to Excel/PDF
3. **Historical Tracking**: Track participation changes over time
4. **Notifications**: Alert users of data validation status
5. **Audit Dashboard**: Track all participation data changes

## 📝 Implementation Notes

### **Database Relations**
- Links to `Arrondissement` via `codeCommune`
- Supports department-level access through arrondissement relations
- Maintains referential integrity

### **Performance Considerations**
- Efficient queries with proper indexing
- Pagination for large datasets
- Caching for frequently accessed data
- Optimized bulk operations

### **Error Handling**
- Graceful error messages
- User-friendly validation feedback
- Proper API error responses
- Fallback UI states

---

**Created**: 2024  
**Version**: 1.0  
**Compatibility**: React 18+, TypeScript 4.9+, Prisma 4.0+

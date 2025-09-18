# 🚀 API Endpoints Summary

## 📋 Overview

This document summarizes all the API endpoints created for the election result reporting system in the `api-crud` project.

## 🏗️ Database Schema Updates

### **New Models Added**
1. **ParticipationCommune** - Arrondissement participation data
2. **PvDepartement** - Departmental PV documents

### **Updated Relations**
- Added `participationCommunes` relation to `Arrondissement` model
- Added `pvDepartements` relation to `Departement` model

## 🔗 API Endpoints Created

### **1. Participation Commune APIs**

#### **Main CRUD Operations**
```
GET    /api/participation-commune                    # Get all participation commune data
POST   /api/participation-commune                    # Create new participation commune data
GET    /api/participation-commune/[id]               # Get by ID
PUT    /api/participation-commune/[id]               # Update by ID
DELETE /api/participation-commune/[id]               # Delete by ID
```

#### **Territorial Access**
```
GET    /api/participation-commune/user               # Get user's assigned data
GET    /api/participation-commune/arrondissement/[code] # Get by arrondissement
```

#### **Validation Workflow**
```
POST   /api/participation-commune/[id]/validate      # Validate single record
POST   /api/participation-commune/[id]/approve       # Approve single record
POST   /api/participation-commune/[id]/reject        # Reject single record
```

#### **Bulk Operations**
```
POST   /api/participation-commune/bulk/validate      # Bulk validate
POST   /api/participation-commune/bulk/approve       # Bulk approve
POST   /api/participation-commune/bulk/reject        # Bulk reject
```

### **2. Territorial Access Control APIs**

#### **User Access**
```
GET    /api/territorial-access/user                  # Get user's territorial access
```

#### **Access Validation**
```
GET    /api/territorial-access/department/[code]     # Check department access
GET    /api/territorial-access/arrondissement/[code] # Check arrondissement access
GET    /api/territorial-access/bureau-vote/[code]    # Check bureau de vote access
```

#### **Edit Permission Validation**
```
GET    /api/territorial-access/can-edit-department/[code]           # Can edit department data
GET    /api/territorial-access/can-edit-arrondissement/[code]       # Can edit arrondissement data
GET    /api/territorial-access/can-edit-bureau-vote/[code]          # Can edit bureau data
GET    /api/territorial-access/can-edit-participation-commune/[code] # Can edit participation commune
```

### **3. Resultat Departement APIs**

#### **Main CRUD Operations**
```
GET    /api/resultat-departement                     # Get all resultat departement data
POST   /api/resultat-departement                     # Create new resultat departement data
GET    /api/resultat-departement/[id]                # Get by ID
PUT    /api/resultat-departement/[id]                # Update by ID
DELETE /api/resultat-departement/[id]                # Delete by ID
```

### **4. PV Departement APIs**

#### **Main CRUD Operations**
```
GET    /api/pv-departement                           # Get all PV departement data
POST   /api/pv-departement                           # Create new PV departement data
GET    /api/pv-departement/[id]                      # Get by ID
PUT    /api/pv-departement/[id]                      # Update by ID
DELETE /api/pv-departement/[id]                      # Delete by ID
```

## 🔧 Existing APIs (Already Present)

### **Commission APIs**
- `/api/commission-departementale` - Departmental commissions
- `/api/membre-commission` - Commission members
- `/api/fonction-commission` - Commission functions

### **Redressement APIs**
- `/api/redressement-bureau-vote` - Bureau vote adjustments
- `/api/redressement-candidat` - Candidate adjustments

### **Participation APIs**
- `/api/participation-departement` - Departmental participation

### **Document APIs**
- `/api/document-arrondissement` - Arrondissement documents

### **Territorial APIs**
- `/api/arrondissement` - Arrondissements
- `/api/departements` - Departments
- `/api/regions` - Regions
- `/api/bureaux-vote` - Bureau de votes

## 📊 API Features

### **CORS Support**
All endpoints include proper CORS headers for cross-origin requests:
```typescript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

### **Error Handling**
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages
- Console logging for debugging

### **Data Validation**
- Required field validation
- Type conversion and validation
- Business logic validation
- Input sanitization

### **Relationships**
- Proper Prisma relations
- Nested data inclusion
- Optimized queries
- Consistent data structure

## 🔍 Query Parameters

### **Filtering Support**
Most GET endpoints support filtering via query parameters:

#### **Participation Commune**
- `?arrondissement=123` - Filter by arrondissement
- `?departement=456` - Filter by department
- `?region=789` - Filter by region

#### **Resultat Departement**
- `?departement=123` - Filter by department
- `?parti=456` - Filter by political party

#### **PV Departement**
- `?departement=123` - Filter by department
- `?region=456` - Filter by region

## 🚀 Usage Examples

### **Get All Participation Commune Data**
```bash
GET /api/participation-commune
```

### **Get Participation Data for Specific Arrondissement**
```bash
GET /api/participation-commune?arrondissement=123
```

### **Create New Participation Commune Data**
```bash
POST /api/participation-commune
Content-Type: application/json

{
  "codeCommune": 123,
  "nombreBureaux": 5,
  "nombreInscrits": 1000,
  "nombreVotants": 800,
  "bulletinsNuls": 10,
  "suffragesValables": 790
}
```

### **Bulk Validate Participation Data**
```bash
POST /api/participation-commune/bulk/validate
Content-Type: application/json

{
  "ids": [1, 2, 3, 4, 5]
}
```

### **Check Territorial Access**
```bash
GET /api/territorial-access/arrondissement/123
```

## 🔒 Security Considerations

### **Authentication**
- JWT token validation (to be implemented)
- User context extraction
- Role-based access control

### **Authorization**
- Territorial access validation
- Role-based permissions
- Resource-level security

### **Data Protection**
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## 📈 Performance Optimizations

### **Database Queries**
- Optimized Prisma queries
- Proper indexing
- Relationship loading
- Query batching

### **Response Optimization**
- Selective field inclusion
- Pagination support
- Caching headers
- Compression

## 🧪 Testing

### **Test Scripts Available**
- `test-arrondissement-api.js`
- `test-commission-api.js`
- `test-participation-api.js`
- `test-redressement-api.js`

### **API Testing**
- CORS testing
- Endpoint validation
- Error handling testing
- Performance testing

## 🔄 Future Enhancements

### **Planned Features**
1. **Authentication Integration** - JWT token validation
2. **Role-Based Access Control** - Granular permissions
3. **Audit Logging** - Track all API calls
4. **Rate Limiting** - Prevent API abuse
5. **Caching** - Redis integration
6. **Webhooks** - Real-time notifications
7. **API Documentation** - OpenAPI/Swagger specs
8. **Monitoring** - Health checks and metrics

### **Database Migrations**
- Run `npx prisma migrate dev` to apply schema changes
- Run `npx prisma generate` to update Prisma client
- Run `npx prisma db seed` to populate test data

---

**Created**: 2024  
**Version**: 1.0  
**Compatibility**: Next.js 14+, Prisma 5+, PostgreSQL

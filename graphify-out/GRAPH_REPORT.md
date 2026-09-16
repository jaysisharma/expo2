# Graph Report - .  (2026-09-16)

## Corpus Check
- Large corpus: 334 files · ~2,976,964 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 285 nodes · 261 edges · 9 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `notify()` - 25 edges
2. `POST()` - 14 edges
3. `notify()` - 12 edges
4. `recordHistory()` - 9 edges
5. `GET()` - 8 edges
6. `getAdminData()` - 7 edges
7. `handleAddSubmit()` - 6 edges
8. `handleSaveEdit()` - 5 edges
9. `handleKeyDown()` - 5 edges
10. `generateStaticParams()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `generateQRCodeMatrix()` --calls--> `GET()`  [INFERRED]
  /Users/jaysisharma/Desktop/expo2/src/lib/qrCodeGenerator.ts → /Users/jaysisharma/Desktop/expo2/src/app/api/floor-plan/save/route.ts
- `handleAddSubmit()` --calls--> `GET()`  [INFERRED]
  /Users/jaysisharma/Desktop/expo2/src/app/admin/exhibitors/page.tsx → /Users/jaysisharma/Desktop/expo2/src/app/api/floor-plan/save/route.ts
- `handleAddSponsor()` --calls--> `GET()`  [INFERRED]
  /Users/jaysisharma/Desktop/expo2/src/app/admin/sponsors/page.tsx → /Users/jaysisharma/Desktop/expo2/src/app/api/floor-plan/save/route.ts
- `POST()` --calls--> `addFirebaseRegistration()`  [INFERRED]
  /Users/jaysisharma/Desktop/expo2/src/app/api/floor-plan/save/route.ts → /Users/jaysisharma/Desktop/expo2/src/lib/firebaseDb.ts
- `POST()` --calls--> `toggleFirebaseCheckin()`  [INFERRED]
  /Users/jaysisharma/Desktop/expo2/src/app/api/floor-plan/save/route.ts → /Users/jaysisharma/Desktop/expo2/src/lib/firebaseDb.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (20): downloadFullDatabaseBackup(), exportCSV(), fetchBoothsData(), fetchData(), fetchInquiries(), handleAddRegistration(), handleAddSponsor(), handleAddSubmit() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (17): alignSelected(), applyCategoryPreset(), clearCanvas(), deleteSelected(), duplicateSelected(), handleBatchRenumber(), handleGlobalMouseUp(), handleKeyDown() (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (16): addFirebaseInquiry(), addFirebaseRegistration(), deleteFirebaseRegistration(), getFirebaseBoothOverrides(), getFirebaseInquiries(), getFirebaseRegistrations(), getFirebaseSettings(), setFirebaseBoothOverride() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (7): useAdminAuth(), AdminHeader(), AdminThemeProvider(), useAdminTheme(), AdminLayoutInner(), AdminLoginPage(), useTheme()

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (6): handleAddCustomText(), handleDeleteCustomText(), handleGlobalMouseMove(), handleSave(), notify(), updateCurrentConfig()

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (4): NotFound(), generateStaticParams(), SingleExhibitorPage(), SingleNewsPage()

### Community 7 - "Community 7"
Cohesion: 0.47
Nodes (4): handleDocumentClick(), handleSubmit(), triggerPdfDownloadModal(), validate()

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (1): generateQRCodeMatrix()

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): handleClose(), handleKeyDown()

## Knowledge Gaps
- **Thin community `Community 9`** (4 nodes): `generateQRCodeDataURL()`, `generateQRCodeMatrix()`, `generateQRCodeSVG()`, `qrCodeGenerator.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `WelcomeExpoModal.tsx`, `handleClose()`, `handleKeyDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 9`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `handleAddSubmit()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `POST()` (e.g. with `addFirebaseRegistration()` and `toggleFirebaseCheckin()`) actually correct?**
  _`POST()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `GET()` (e.g. with `handleAddSubmit()` and `handleAddSponsor()`) actually correct?**
  _`GET()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
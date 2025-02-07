#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1738921553
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Fri Feb 07  2:45:53 PM PST 2025"
#define CURRENT_BRANCH "fix-backend-crash"
#define COMMIT_HASH "d04a052a9ada234b7ee83bde2c565b59b2f76b36"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__

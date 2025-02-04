#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1738632348
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Tue Feb 04  6:25:48 AM PST 2025"
#define CURRENT_BRANCH "fe-be-staging-v1.0.0"
#define COMMIT_HASH "38668a813dc55aebf83b0a987f3c9cd46873c770"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
